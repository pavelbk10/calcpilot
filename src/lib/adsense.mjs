export function isAdsenseConfigured({enabled,publisherId,siteUrl},origin){
  if(enabled!=='true'||!/^ca-pub-\d{16}$/.test(publisherId||''))return false;
  try{
    const site=new URL(siteUrl);
    const host=site.hostname;
    if(site.protocol!=='https:'||site.origin!==origin)return false;
    if(['localhost','127.0.0.1','[::1]','your-domain.com'].includes(host)||host.endsWith('.localhost'))return false;
    return true;
  }catch{return false;}
}

export function hasAdsenseConsent(data){
  if(data?.cmpStatus!=='loaded'||!['tcloaded','useractioncomplete'].includes(data.eventStatus))return false;
  if(data.gdprApplies===false)return true;
  if(data.gdprApplies!==true||data.publisher?.restrictions&&Object.keys(data.publisher.restrictions).length)return false;
  return data.vendor?.consents?.[755]===true&&[1,3,4,7,9,10].every(purpose=>data.purpose?.consents?.[purpose]===true);
}