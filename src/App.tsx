import { Layout } from './components/Layout';
import { Dropzone } from './components/Dropzone';
import { ShieldCheck } from '@phosphor-icons/react';

function App() {
  return (
    <Layout>
      {/* Header Block */}
      <header className="w-full flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none tracking-tighter">O</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">OmniDocs</h1>
            <p className="text-sm font-medium text-slate-500">Universal Formats</p>
          </div>
        </div>

        <div className="glass-panel px-4 py-2 flex items-center gap-2">
          <ShieldCheck weight="fill" className="text-emerald-500 w-4 h-4" />
          <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase">100% Local • Zero Upload</span>
        </div>
      </header>

      {/* Main Bento Grid Area */}
      <div className="w-full w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center">
        <Dropzone />
      </div>

    </Layout>
  )
}

export default App;
