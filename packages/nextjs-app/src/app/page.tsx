import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">翻訳アプリ</h1>
        <ul className="space-y-4">
          <li>
            <Link
              href="/basic"
              className="text-blue-600 hover:underline text-lg"
            >
              Basic - シンプルな翻訳
            </Link>
          </li>
          <li>
            <Link
              href="/basic-routing"
              className="text-blue-600 hover:underline text-lg"
            >
              Basic Routing - 翻訳履歴とルーティング
            </Link>
          </li>
          <li>
            <Link
              href="/nani"
              className="text-blue-600 hover:underline text-lg"
            >
              Nani!? - nani.now クローン
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
