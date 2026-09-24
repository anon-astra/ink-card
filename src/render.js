const avatars=new Map();
function loadAvatar(url){
 if(!url)return Promise.resolve(null);
 if(!avatars.has(url)){
  const pending=new Promise(resolve=>{
   const image=new Image();image.crossOrigin='anonymous';image.referrerPolicy='no-referrer';
   const timer=setTimeout(()=>resolve(null),8000);
   image.onload=()=>{clearTimeout(timer);resolve(image);};
   image.onerror=()=>{clearTimeout(timer);resolve(null);};image.src=url;
  });
  if(avatars.size>=12)avatars.delete(avatars.keys().next().value);
  avatars.set(url,pending);
 }
 return avatars.get(url);
}
const bird='M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723 9.99 9.99 0 0 1-3.127 1.195 4.92 4.92 0 0 0-8.384 4.482A13.98 13.98 0 0 1 1.64 3.162a4.92 4.92 0 0 0 1.523 6.574 4.9 4.9 0 0 1-2.229-.616v.061a4.923 4.923 0 0 0 3.946 4.827 4.93 4.93 0 0 1-2.224.084 4.93 4.93 0 0 0 4.6 3.419 9.87 9.87 0 0 1-6.115 2.107c-.398 0-.79-.023-1.175-.068a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.01-7.503 14.01-14.01 0-.213-.005-.425-.014-.636a10.013 10.013 0 0 0 2.457-2.548z';
export async function renderCard(canvas,{text,name,handle,avatar}){
 await document.fonts.load('700 48px Inter');
 await document.fonts.load('400 24px Inter');
 if(!document.fonts.check('700 48px Inter'))throw new Error('Inter could not load. Please refresh and try again.');
 const portrait=await loadAvatar(avatar);
 text=text.trim();
 const ctx=canvas.getContext('2d');
 const width=1200,padding=96,max=width-padding*2;
 const height=1200,textTop=222,bottomPadding=72;
 function layout(size){
  ctx.font=`700 ${size}px Inter`;
  const lines=[];
  for(const paragraph of text.split('\n')){
   let line='';
   for(const word of paragraph.split(/(\s+)/)){
    if(ctx.measureText(line+word).width<=max){line+=word;continue;}
    if(line.trim())lines.push(line.trimEnd());
    line=word.trimStart();
    if(ctx.measureText(line).width>max){
     let part='';
     for(const {segment} of new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(line)){
      if(part&&ctx.measureText(part+segment).width>max){lines.push(part);part='';}
      part+=segment;
     }
     line=part;
    }
   }
   lines.push(line.trimEnd());
  }
  const leading=size*1.25;
  const ascent=Math.max(...lines.map(line=>ctx.measureText(line||'Mg').actualBoundingBoxAscent||size));
  const descent=ctx.measureText(lines.at(-1)||'Mg').actualBoundingBoxDescent||size*.2;
  return {lines,leading,ascent,bottom:textTop+ascent+(lines.length-1)*leading+descent};
 }
 ctx.textBaseline='alphabetic';
 let low=1,high=180,size=1,fitted=layout(1);
 while(low<=high){
  const candidate=Math.floor((low+high)/2),result=layout(candidate);
  if(result.bottom<=height-bottomPadding){size=candidate;fitted=result;low=candidate+1;}
  else high=candidate-1;
 }
 const {lines,leading,ascent}=fitted;
 canvas.width=2048;canvas.height=2048;
 ctx.scale(2048/width,2048/height);
 ctx.fillStyle='#09090b';ctx.fillRect(0,0,width,height);
 ctx.textBaseline='top';
 const avatarY=86,nameX=padding+104;
 ctx.save();ctx.beginPath();ctx.arc(padding+40,avatarY+40,40,0,Math.PI*2);ctx.clip();
 ctx.fillStyle='#29292f';ctx.fillRect(padding,avatarY,80,80);
 if(portrait){
  const side=Math.min(portrait.naturalWidth,portrait.naturalHeight);
  ctx.drawImage(portrait,(portrait.naturalWidth-side)/2,(portrait.naturalHeight-side)/2,side,side,padding,avatarY,80,80);
 }else{
  ctx.fillStyle='#b6b6be';ctx.font='700 32px Inter';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(Array.from(name||'?')[0].toUpperCase(),padding+40,avatarY+40);
 }
 ctx.restore();
 ctx.fillStyle='#f5f5f6';ctx.font='700 30px Inter';
 ctx.fillText(name||'Author',nameX,90,width-padding-90-nameX);
 ctx.fillStyle='#96969f';ctx.font='400 24px Inter';
 ctx.fillText(handle?'@'+handle.replace(/^@/,''):'@username',nameX,137,width-padding-90-nameX);
 ctx.save();ctx.translate(width-padding-52,99);ctx.scale(52/24,52/24);
 ctx.fillStyle='#f5f5f6';ctx.fill(new Path2D(bird));ctx.restore();
 ctx.fillStyle='#f5f5f6';ctx.font=`700 ${size}px Inter`;
 ctx.textBaseline='alphabetic';
 lines.forEach((line,i)=>ctx.fillText(line,padding,textTop+ascent+i*leading));
 return {width:2048,height:2048,avatarMissing:Boolean(avatar&&!portrait)};
}
