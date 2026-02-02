async function Ssr({text,mSecond}) {
 await new Promise(r=>setTimeout(()=>r(),mSecond));

  return (
    <div className="ssr">
      <p>{text}</p>
    </div>
  );
}
export default Ssr