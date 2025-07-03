type DashboardProps = {
    styles : {readonly [key:string]:string};
}

import Link from 'next/link';

export default function Dashboard({styles}:DashboardProps){
  return (
    <section className={styles.dashboard}>
        <h1 className={styles.heading}>Train AI models on the Web</h1>
        <Link href='#trainModel'><button className={styles.begin}>Get Started</button></Link>
    </section>
  )
}