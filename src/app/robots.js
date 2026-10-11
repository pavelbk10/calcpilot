export const dynamic='force-static';export default function robots(){const url=process.env.NEXT_PUBLIC_SITE_URL;return {rules:{userAgent:'*',allow:'/'},...(url?{sitemap:url+'/sitemap.xml'}:{})}}
