import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const prompt = body.prompt;

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        // Use Pollinations.ai instead of local Stable Diffusion
        // This removes the need for a local GPU and installation
        const width = 1024;
        const height = 1024;
        const seed = Math.floor(Math.random() * 1000000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

        console.log(`🎨 Generating image via Pollinations: "${prompt}"...`);

        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            throw new Error(`Pollinations Error: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const image_b64 = buffer.toString('base64');

        return NextResponse.json({ image: image_b64 });

    } catch (error: any) {
        console.error('❌ Error in generate-image API:', error);

        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
