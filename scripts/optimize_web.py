from pathlib import Path
import sys
root=Path(sys.argv[1])
file=root/'index.html'
html=file.read_text()
assert '"canvasResizePolicy":0' in html or '"canvasResizePolicy": 0' in html
css="""<style>body{display:grid;place-items:center;height:100vh;background:#0b0c0b}#canvas{width:min(100vw,160vh);height:min(62.5vw,100vh);object-fit:contain}#koa-quality{position:fixed;top:4px;left:50%;transform:translateX(-50%);z-index:5;background:#151713e8;color:#e4d4ae;font:12px Arial;padding:5px 8px;border:1px solid #7b6748;border-radius:5px}#koa-quality select{background:#272a23;color:#eadfca;border:0;font:inherit}#koa-quality small{margin-left:6px}</style>"""
html=html.replace('</head>',css+'</head>')
controls="""<div id="koa-quality">Gráficos: <select id="koa-mode" aria-label="Qualidade gráfica"><option value="480">Ultra leve</option><option value="640">Leve</option><option value="800">Equilibrado</option><option value="960">Alta</option></select><small id="koa-fps"></small></div><script>
(function(){
const canvas=document.getElementById('canvas'),select=document.getElementById('koa-mode');
const modes=[480,640,800,960];let width=640;
try{const saved=Number(localStorage.getItem('koa-render-width'));if(modes.includes(saved))width=saved;}catch(e){}
function apply(w){canvas.width=w;canvas.height=w*5/8;select.value=String(w);try{localStorage.setItem('koa-render-width',String(w));}catch(e){}}
apply(width);select.addEventListener('change',()=>{apply(Number(select.value));canvas.focus()});
window.addEventListener('contextmenu',e=>{if(e.target===canvas)e.preventDefault()});
setInterval(()=>{document.getElementById('koa-fps').textContent=Number.isFinite(window.koaFPS)?window.koaFPS+' FPS':''},1000);
})();
</script>"""
html=html.replace('<script src="index.js"></script>',controls+'<script src="index.js"></script>')
assert 'id="koa-mode"' in html
file.write_text(html)
