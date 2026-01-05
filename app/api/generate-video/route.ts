import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutes timeout for Vercel/Next.js (if supported by plan)

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const mode = formData.get('mode') as string || (formData.get('image') ? 'image' : 'text');
        
        if (mode === 'text') {
            const prompt = formData.get('prompt') as string;
            const apiKey = formData.get('apiKey') as string;
            const useMiniMax = formData.get('useMiniMax') === 'true';

            if (!prompt) {
                return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
            }

            if (useMiniMax) {
                return await generateMiniMax(prompt, apiKey);
            } else {
                return NextResponse.json({ error: 'Only MiniMax is currently supported for text-to-video via this API.' }, { status: 400 });
            }
        } else if (mode === 'image') {
             // Basic implementation for image handling if needed later
             // For now, we can try to support SVD via HuggingFace if the token is available server-side
             // But usually it's better to keep large file uploads separate or use a specific service.
             // Given the user request, let's focus on fixing the text flow first or return a "Not Implemented" for image
             // allowing the client to fallback or handle it.
             return NextResponse.json({ error: 'Image-to-video generation should be handled client-side for now.' }, { status: 501 });
        }

        return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });

    } catch (error: any) {
        console.error('Video Generation Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

async function generateMiniMax(prompt: string, apiKey: string) {
    if (!apiKey) {
        return NextResponse.json({ error: 'MiniMax API Key is required' }, { status: 401 });
    }

    console.log("🎬 Starting MiniMax Generation for:", prompt);

    // 1. Create Task
    const createRes = await fetch('https://api.minimaxi.com/v1/video_generation', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "MiniMax-Hailuo-2.3",
            prompt: prompt,
            duration: 6,
            resolution: "1280x720"
        })
    });

    if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(`MiniMax API Error: ${err.base_resp?.status_msg || createRes.statusText}`);
    }

    const createData = await createRes.json();
    const taskId = createData.task_id;
    if (!taskId) throw new Error("No Task ID received from MiniMax");

    console.log("⏳ Task ID:", taskId);

    // 2. Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // ~5 minutes

    while (attempts < maxAttempts) {
        attempts++;
        await new Promise(r => setTimeout(r, 5000)); // Wait 5s

        const checkRes = await fetch(`https://api.minimaxi.com/v1/query/video_generation?task_id=${taskId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!checkRes.ok) continue;

        const checkData = await checkRes.json();
        
        if (checkData.status === 'Success') {
            if (checkData.file_id) {
                // Retrieve the actual download URL
                const fileRes = await fetch(`https://api.minimaxi.com/v1/files/retrieve?file_id=${checkData.file_id}`, {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
                
                if (!fileRes.ok) throw new Error("Failed to retrieve file content");
                
                const blob = await fileRes.blob();
                const arrayBuffer = await blob.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64Video = buffer.toString('base64');
                const videoUrl = `data:video/mp4;base64,${base64Video}`;
                
                return NextResponse.json({ videoUrl });
            }
        } else if (checkData.status === 'Fail') {
            throw new Error("Generation failed in MiniMax Cloud");
        }
    }

    throw new Error("Generation timed out");
}
