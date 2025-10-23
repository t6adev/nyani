import { TranslationForm } from './_components/TranslationForm';

export default function NaniPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-block bg-blue-500 rounded-3xl p-6 mb-6">
            <div className="text-white text-5xl">👀</div>
          </div>
          <h1 className="text-5xl font-bold mb-4">Nani !?</h1>
        </div>

        {/* Translation Form */}
        <TranslationForm />
      </div>
    </div>
  );
}
