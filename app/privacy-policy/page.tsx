import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>

            <p className="mb-4 text-gray-600">
                Última actualización: {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-6 text-gray-800">
                <section>
                    <p>
                        El Board Latinoamericano de Perfusión ("nosotros", "nuestro") opera el sitio web
                        https://www.boardlatinoamericanodeperfusion.com (el "Servicio").
                    </p>
                    <p className="mt-2">
                        Esta página le informa sobre nuestras políticas con respecto a la recopilación, uso y divulgación
                        de datos personales cuando utiliza nuestro Servicio y las opciones que tiene asociadas con esos datos.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">Recopilación y Uso de Información</h2>
                    <p>
                        Recopilamos varios tipos diferentes de información con diversos fines para proporcionar y mejorar nuestro Servicio.
                    </p>

                    <h3 className="text-xl font-medium mt-4 mb-2">Tipos de Datos Recopilados</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>Datos Personales:</strong> Al utilizar nuestro Servicio, es posible que le solicitemos que nos proporcione
                            cierta información de identificación personal que se puede utilizar para contactarlo o identificarlo
                            ("Datos Personales"). La información de identificación personal puede incluir, entre otros:
                            Dirección de correo electrónico, Nombre y apellidos, Cookies y Datos de uso.
                        </li>
                        <li>
                            <strong>Datos de Uso:</strong> También podemos recopilar información sobre cómo se accede y utiliza el Servicio
                            ("Datos de Uso"). Estos Datos de Uso pueden incluir información como la dirección de protocolo de Internet
                            de su computadora (por ejemplo, dirección IP), tipo de navegador, versión del navegador, las páginas de nuestro
                            Servicio que visita, la hora y fecha de su visita, el tiempo dedicado a esas páginas, identificadores únicos
                            de dispositivos y otros datos de diagnóstico.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">Privacidad de los Niños</h2>
                    <p>
                        Nuestro Servicio no está dirigido a ninguna persona menor de 13 años ("Niños").
                    </p>
                    <p className="mt-2">
                        No recopilamos intencionalmente información de identificación personal de ninguna persona menor de 13 años.
                        Si usted es un padre o tutor y sabe que sus Hijos nos han proporcionado Datos Personales, comuníquese con nosotros.
                        Si nos damos cuenta de que hemos recopilado Datos Personales de niños sin verificación del consentimiento de los padres,
                        tomamos medidas para eliminar esa información de nuestros servidores.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">Cookies y Datos de Seguimiento</h2>
                    <p>
                        Utilizamos cookies y tecnologías de seguimiento similares para rastrear la actividad en nuestro Servicio y mantener
                        cierta información. Usted puede indicar a su navegador que rechace todas las cookies o que le indique cuándo se envía una cookie.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">Seguridad de los Datos</h2>
                    <p>
                        La seguridad de sus datos es importante para nosotros, pero recuerde que ningún método de transmisión a través de Internet
                        o método de almacenamiento electrónico es 100% seguro. Si bien nos esforzamos por utilizar medios comercialmente aceptables
                        para proteger sus Datos Personales, no podemos garantizar su seguridad absoluta.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">Cambios a Esta Política de Privacidad</h2>
                    <p>
                        Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva
                        Política de Privacidad en esta página. Se le aconseja revisar esta Política de Privacidad periódicamente para detectar cualquier cambio.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">Contáctenos</h2>
                    <p>
                        Si tiene alguna pregunta sobre esta Política de Privacidad, por favor contáctenos a través de nuestro sitio web.
                    </p>
                </section>
            </div>
        </div>
    );
}
