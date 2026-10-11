import './globals.css';
import './application.css';
import './enhancements.css';
import './accessibility.css';
import Shell from '../components/Shell';
import AdSense from '../components/AdSense';
export const metadata={title:{default:'PB CALC — Your money. A clearer picture.',template:'%s | PB CALC'},description:'Interactive mortgage, loan, savings and car calculators. Manage your household and car expenses privately in your browser.'};
export const viewport={themeColor:'#12695c',viewportFit:'cover'};
export default function Layout({children}){return <html lang="he" dir="rtl"><body><Shell>{children}</Shell><AdSense/></body></html>}
