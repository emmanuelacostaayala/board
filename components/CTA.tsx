import Image from "next/image";
import Link from "next/link";

const Cta = () => {
    return (
        <section className="cta-section">
            <div className="cta-badge">Aprende a tu manera</div>
            <h2 className="text-3xl font-bold">
                Crea y personaliza tu compañero con IA 
            </h2>
            <p>Elije un nombre, tema del exámen de perfusión, voz, personalidad, etc y haz que sea divertido!</p>
            <Image src="images/cta.svg" alt="cta" width={362} height={232} />
            <button className="btn-primary">
                <Image src="/icons/plus.svg" alt="plus" width={12} height={12}/>
                <Link href="/companions/new">
                    <p>Crear nuevo acompañante</p>
                </Link>
            </button>
        </section>
    )
}
export default Cta
