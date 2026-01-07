export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
