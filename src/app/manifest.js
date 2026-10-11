export const dynamic='force-static';
export default function manifest(){
  const base=process.env.BASE_PATH||'';
  return {id:base+'/',name:'PB CALC',short_name:'PB CALC',description:'Personal finance calculators and local budget tracking',lang:'he',dir:'rtl',start_url:base+'/',scope:base+'/',display:'standalone',background_color:'#f4f7f8',theme_color:'#12695c',icons:[{src:base+'/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:base+'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},{src:base+'/icon-maskable.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]};
}