import { renderToPipeableStream } from "react-dom/server";
import { Suspense } from 'react';
import Ssr from "./ssr";
import Csr from "../csr/csr";

function render(res, template) {
  const [head, tail] = template.split("<!--ssr-->");

  let didError = false;

  const { pipe } = renderToPipeableStream(
    <div>
      <Suspense fallback={<p className="loading">ヘッダー読み込み中...</p>}>
        <Ssr text="■■ヘッダー■■" mSecond={5000} />
      </Suspense>
      <div id="csr">
        <Csr />
      </div>
      <Suspense fallback={<p className="loading">フッター読み込み中...</p>}>
        <Ssr text="■■フッター■■" mSecond={3000} />
      </Suspense>
    </div>,
    {
      onShellReady() {
        
        res.status(didError ? 500 : 200);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.write(head);
        pipe(res);
        res.write(tail);
      },
      onError(err) {
        didError = true;
        console.error(err);
      },
    }

  );

}
export default render
