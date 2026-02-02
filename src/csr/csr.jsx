import { useState } from "react";
function Csr() {

  const [sourceText, setSourceText] = useState("Clickでソースコードを取得");
  const [busy, setBusy] = useState(false);

  const fetchData = async () => {
    setBusy(true);
    const location = `${window.location.href}`;
    try {
      const html = await fetch(location)
        .then(data => data.text());

      setSourceText(html);
    } catch (error) {
      setSourceText('Error:', error);
    }
    setBusy(false);
  };

  return (
    <div id="client">
      <p>CSR側</p>
      <p><button className={busy ? "loading" : ""} onClick={
        () => {
          fetchData();
        }
      }>Click!!</button></p>
      <code style={{ whiteSpace: "pre" }}>
        {sourceText}
      </code>
    </div>
  );
}

export default Csr