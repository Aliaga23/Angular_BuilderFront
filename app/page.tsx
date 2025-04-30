import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 186 200"
                className="text-red-500 mr-2"
              >
                <path
                  fill="currentColor"
                  d="M93 0 0 33.2 14 156.3l79 43.7 79-43.7 14-123.1L93 0zm0 18.6 75.5 27.1-12.7 112-62.8 34.8-62.8-34.8-12.7-112L93 18.6z"
                />
                <path
                  fill="currentColor"
                  d="M93 18.6 30.2 45.7l8.7 95.5 54.1 29.9 54.1-30 8.7-95.4L93 18.6zm0 24.2 35.2 74.4h-22.9l-12.3-30.7-12.3 30.7H58.9l34.1-74.4z"
                />
              </svg>
              <span className="text-xl font-bold">Angular Builder</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors">
              Características
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
            >
              Cómo funciona
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
            >
              Testimonios
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <span className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 py-2 text-gray-600 bg-transparent">
                Iniciar sesión
              </span>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm transition-all hover:shadow"
              >
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-red-100/20 to-transparent"></div>
        </div>

        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-1 bg-red-50 rounded-full text-red-500 font-medium text-sm mb-2">
                Diseño visual para Angular
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                Construye interfaces{" "}
                <span className="text-red-500 relative">
                  Angular
                  <span className="absolute bottom-1 left-0 w-full h-1 bg-red-100"></span>
                </span>{" "}
                sin escribir código
              </h1>
              <p className="text-lg text-gray-600 max-w-[500px] leading-relaxed">
                Diseña, colabora y exporta componentes Angular profesionales con nuestro constructor visual intuitivo.
                Perfecto para diseñadores y desarrolladores.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-purple-500/10 rounded-lg blur-3xl"></div>
              <div className="relative bg-white p-3 rounded-xl shadow-xl border border-gray-100">
                <div className="aspect-[16/10] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="120"
                      height="120"
                      viewBox="0 0 186 200"
                      className="text-red-500"
                    >
                      <path
                        fill="currentColor"
                        d="M93 0 0 33.2 14 156.3l79 43.7 79-43.7 14-123.1L93 0zm0 18.6 75.5 27.1-12.7 112-62.8 34.8-62.8-34.8-12.7-112L93 18.6z"
                      />
                      <path
                        fill="currentColor"
                        d="M93 18.6 30.2 45.7l8.7 95.5 54.1 29.9 54.1-30 8.7-95.4L93 18.6zm0 24.2 35.2 74.4h-22.9l-12.3-30.7-12.3 30.7H58.9l34.1-74.4z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">angular-builder.app</div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-5/6"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-50 rounded-full -z-10"></div>
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-red-50 rounded-full -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-block px-3 py-1 bg-red-50 rounded-full text-red-500 font-medium text-sm mb-4">
              Características
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Diseñado específicamente para Angular</h2>
            <p className="text-gray-600 leading-relaxed">
              Nuestro constructor visual está optimizado para crear interfaces Angular de alta calidad, respetando las
              mejores prácticas y patrones del framework.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                ),
                title: "Componentes Angular nativos",
                description:
                  "Arrastra y suelta componentes Angular nativos, con soporte para directivas, pipes y servicios.",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m7 10 3 3 7-7" />
                  </svg>
                ),
                title: "Colaboración en tiempo real",
                description:
                  "Trabaja con tu equipo en tiempo real, viendo los cambios al instante y coordinando el diseño.",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <path d="M21 7v6h-6" />
                    <path d="m21 13-9-9-9 9" />
                    <path d="M3 13v8h18v-8" />
                  </svg>
                ),
                title: "Exportación a Angular",
                description:
                  "Exporta tus diseños directamente a código Angular limpio y optimizado, listo para usar en tu proyecto.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <div className="h-12 w-12 rounded-lg bg-red-50 flex items-center justify-center mb-6 group-hover:bg-red-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-block px-3 py-1 bg-red-50 rounded-full text-red-500 font-medium text-sm mb-4">
              Testimonios
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Lo que dicen nuestros usuarios</h2>
            <p className="text-gray-600 leading-relaxed">
              Desarrolladores y diseñadores de todo el mundo confían en Angular Builder para sus proyectos.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "María González",
                role: "Frontend Developer @ TechCorp",
                quote:
                  "Angular Builder ha revolucionado nuestra forma de trabajar. Ahora podemos prototipar y desarrollar componentes Angular en una fracción del tiempo que nos tomaba antes.",
              },
              {
                name: "Carlos Rodríguez",
                role: "UX Designer @ DesignStudio",
                quote:
                  "Como diseñador, siempre fue un desafío comunicarme con los desarrolladores. Con Angular Builder, puedo crear prototipos funcionales que se convierten directamente en código.",
              },
              {
                name: "Ana Martínez",
                role: "CTO @ Startup",
                quote:
                  "Implementamos Angular Builder en nuestro flujo de trabajo y hemos reducido el tiempo de desarrollo en un 40%. La colaboración en tiempo real es una característica que no sabíamos que necesitábamos.",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12.5 25H7.5C6.83696 25 6.20107 24.7366 5.73223 24.2678C5.26339 23.7989 5 23.163 5 22.5V20C5 16.13 8.13 13 12 13H12.5C13.163 13 13.7989 13.2634 14.2678 13.7322C14.7366 14.2011 15 14.837 15 15.5V22.5C15 23.163 14.7366 23.7989 14.2678 24.2678C13.7989 24.7366 13.163 25 12.5 25ZM27.5 25H22.5C21.837 25 21.2011 24.7366 20.7322 24.2678C20.2634 23.7989 20 23.163 20 22.5V20C20 16.13 23.13 13 27 13H27.5C28.163 13 28.7989 13.2634 29.2678 13.7322C29.7366 14.2011 30 14.837 30 15.5V22.5C30 23.163 29.7366 23.7989 29.2678 24.2678C28.7989 24.7366 28.163 25 27.5 25Z"
                      fill="#FEE2E2"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex mt-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-yellow-400"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 186 200"
                className="text-red-500 mr-2"
              >
                <path
                  fill="currentColor"
                  d="M93 0 0 33.2 14 156.3l79 43.7 79-43.7 14-123.1L93 0zm0 18.6 75.5 27.1-12.7 112-62.8 34.8-62.8-34.8-12.7-112L93 18.6z"
                />
                <path
                  fill="currentColor"
                  d="M93 18.6 30.2 45.7l8.7 95.5 54.1 29.9 54.1-30 8.7-95.4L93 18.6zm0 24.2 35.2 74.4h-22.9l-12.3-30.7-12.3 30.7H58.9l34.1-74.4z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-900">Angular Builder</span>
            </div>

            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#features" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Características
              </a>
              <a href="#testimonials" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Testimonios
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Contacto
              </a>
            </div>

            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-6 pt-6 text-center">
            <p className="text-xs text-gray-500">© 2025 Angular Builder. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
