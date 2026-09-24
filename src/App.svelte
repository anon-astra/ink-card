<script>
 import {onMount,tick} from 'svelte';
 import {renderCard} from './render.js';
 let url='',name='',handle='',text='',busy=false,saving=false,error='',notice='',canvas,ready=false,dimensions='1200 × 640',renderVersion=0;
 const sample='Good words deserve\na little space.';
 async function draw(){
  if(!canvas)return;
  const version=++renderVersion;ready=false;
  try{
   const result=await renderCard(canvas,{text:text||sample,name:name||'Your name',handle:handle||'username'});
   if(version!==renderVersion)return;
   dimensions=`${result.width} × ${result.height}`;ready=Boolean(text.trim());
  }catch(e){error=e.message;}
 }
 $: if(canvas){text;name;handle;draw();}
 async function loadPost(value=url){
  if(busy)return;
  busy=true;error='';notice='';
  try{
   let parsed;
   try{parsed=new URL(value.trim());}catch{throw new Error('Enter a valid X post link.');}
   const match=parsed.pathname.match(/^\/(?:([A-Za-z0-9_]{1,15})\/status|i\/web\/status)\/(\d+)\/?$/);
   if(parsed.protocol!=='https:'||!['x.com','www.x.com','twitter.com','www.twitter.com','mobile.twitter.com'].includes(parsed.hostname)||!match)throw new Error('Use an https://x.com/username/status/123 post link.');
   let response;
   try{response=await fetch(`https://api.fxtwitter.com/${match[1]||'i'}/status/${match[2]}`,{signal:AbortSignal.timeout(15000),credentials:'omit',referrerPolicy:'no-referrer'});}catch{throw new Error('Post loading is unavailable right now. Paste the text below to make your card.');}
   if(!response.ok)throw new Error('Couldn’t load this post. Paste its text below instead.');
   const data=await response.json();
   const post=data.tweet;
   if(data.code!==200||!post)throw new Error('This post is unavailable. Try another public post or paste its text.');
   const content=typeof post.text==='string'?post.text.trim():'';
   if(!content)throw new Error('This post has no text to turn into a card.');
   if(content.length>5000)throw new Error('This post is too long. Paste a shorter excerpt below.');
   name=typeof post.author?.name==='string'?post.author.name:'';
   handle=typeof post.author?.screen_name==='string'?post.author.screen_name:match[1]||'';
   text=content;url=value;
   await tick();await draw();notice='Post loaded. Check the text before saving.';
   return {name,handle,text};
  }catch(e){error=e.message;throw e;}finally{busy=false;}
 }
 async function save(){
  saving=true;error='';notice='';
  try{
   await draw();if(!ready)throw new Error('Add post text before saving.');
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
   if(!blob)throw new Error('Couldn’t create the PNG. Please try again.');
   const href=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=href;a.download=`${handle.replace(/[^a-z0-9_-]/gi,'')||'post'}-card.png`;
   document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),60000);
   notice='PNG ready — check your downloads.';
  }catch(e){error=e.message;}finally{saving=false;}
 }
 onMount(()=>{
  const lifecycle=new AbortController();
  if(document.modelContext?.registerTool){
   try{Promise.resolve(document.modelContext.registerTool({name:'load_x_post_card',description:'Load one public X post into the visible card preview. Does not download an image.',inputSchema:{type:'object',properties:{url:{type:'string'}},required:['url'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:async input=>{if(typeof input?.url!=='string')throw new Error('URL required');return loadPost(input.url);}},{signal:lifecycle.signal})).catch(()=>{});}catch{}
  }
  return()=>lifecycle.abort();
 });
</script>
<svelte:head><meta name="theme-color" content="#09090b" /></svelte:head>
<header><a class="brand" href="./" aria-label="Ink home"><span class="brand-mark">▤</span> ink<span class="brand-dot">.</span></a><span class="header-note">ONE POST. ONE CARD.</span></header>
<main>
 <section class="editor">
  <p class="eyebrow">X POST → PNG</p>
  <h1>Keep the words.</h1>
  <p class="intro">Turn a post into a card worth saving.</p>
  <form onsubmit={e=>{e.preventDefault();loadPost().catch(()=>{});}}>
   <label for="url">Post link</label>
   <div class="url-row"><input id="url" type="url" placeholder="https://x.com/…/status/…" bind:value={url} required disabled={busy} /><button class="load" disabled={busy}>{busy?'Loading…':'Load post'}</button></div>
  </form>
  <p class="fine">Links are loaded through FxTwitter, a third-party service.</p>
  <div class="divider"><span>or paste the text</span></div>
  <div class="author-row"><div><label for="name">Name</label><input id="name" bind:value={name} maxlength="80" placeholder="Author’s name" disabled={busy}/></div><div><label for="handle">Handle</label><input id="handle" bind:value={handle} maxlength="30" placeholder="@username" disabled={busy}/></div></div>
  <label for="text">Post text</label><textarea id="text" bind:value={text} maxlength="5000" placeholder="The words you want to keep…" disabled={busy}></textarea>
  <div class="text-meta"><span>Inter Bold · Almost black</span><span>{text.length.toLocaleString()} / 5,000</span></div>
  <div aria-live="polite" class="feedback">{#if error}<p class="error" role="alert">{error}</p>{:else if notice}<p>{notice}</p>{/if}</div>
  <button class="save" onclick={save} disabled={!ready||busy||saving}><span>{saving?'Creating PNG…':'Save PNG'}</span><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5"/></svg></button>
  <p class="fine">Public text posts, one at a time. No watermark.</p>
 </section>
 <section class="preview" aria-label="Card preview"><div class="preview-top"><span>YOUR CARD</span><span>{dimensions} PNG</span></div><div class="canvas-wrap"><canvas bind:this={canvas} aria-label={text?`Card by ${name}: ${text}`:'Sample card: Good words deserve a little space.'}></canvas></div><div class="preview-bottom"><span>{text?'Ready to keep.':'Your words go here.'}</span><span>01 / 01</span></div></section>
</main>
<footer><span>A little less noise.</span><span>Made for the words.</span></footer>
