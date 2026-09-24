export async function renderCard(canvas,{text,name,handle}){
 await document.fonts.load('700 48px Inter');
 await document.fonts.load('400 24px Inter');
 if(!document.fonts.check('700 48px Inter'))throw new Error('Inter could not load. Please refresh and try again.');
 const ctx=canvas.getContext('2d');
 const width=1200,padding=96,max=width-padding*2;
 const size=text.length>1200?36:text.length>600?42:48;
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
     if(ctx.measureText(part+segment).width>max){lines.push(part);part='';}
     part+=segment;
    }
    line=part;
   }
  }
  lines.push(line.trimEnd());
 }
 const leading=Math.round(size*1.4);
 const height=Math.max(640,280+lines.length*leading+96);
 if(height>15000)throw new Error('This post is too long for a single image. Shorten the text and try again.');
 canvas.width=width;canvas.height=height;
 ctx.fillStyle='#09090b';ctx.fillRect(0,0,width,height);
 ctx.textBaseline='top';
 ctx.fillStyle='#f5f5f6';ctx.font='700 30px Inter';
 ctx.fillText(name||'Author',padding,90,max-90);
 ctx.fillStyle='#96969f';ctx.font='400 24px Inter';
 ctx.fillText(handle?'@'+handle.replace(/^@/,''):'@username',padding,137,max-90);
 ctx.strokeStyle='#e7e7ec';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(1062,94);ctx.lineTo(1102,143);ctx.moveTo(1102,94);ctx.lineTo(1062,143);ctx.stroke();
 ctx.fillStyle='#f5f5f6';ctx.font=`700 ${size}px Inter`;
 lines.forEach((line,i)=>ctx.fillText(line,padding,236+i*leading));
 return {width,height};
}
