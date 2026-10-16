/*
 * Datos de la web: proyectos, textos, servicios y contacto.
 * Si cambia un proyecto o un enlace, se cambia aquí.
 * Ojo: todo lo que esté en este archivo es público. Por eso no hay teléfono ni correo:
 * los mensajes llegan por el formulario (Web3Forms) y el correo de destino vive en esa cuenta.
 */
window.MARIANA = {
  nombre: "Mariana Díaz",
  nombreCorto: "Mariana",
  pais: "Venezuela",
  oficio: "Diseñadora gráfica",
  lema: "Un pedacito de mí",
  bio: "Enfocada en el branding y la conceptualización de ideas. Disfruto crear y aprender.",
  estudios: {
    carrera: "Artes, mención Diseño gráfico",
    universidad: "Universidad Arturo Michelena",
    anio: 2025,
  },
  contacto: {
    // Clave de acceso de Web3Forms (https://web3forms.com): se crea gratis con el correo de Mariana
    // y es la que decide a qué correo llegan los mensajes. Es pública por diseño; pégala aquí.
    web3formsKey: "",
    // Correo profesional del dominio propio (p. ej. "hola@marianadiaz.design"). Si se rellena, aparece
    // como alternativa bajo el formulario. No poner aquí correos personales (Gmail, etc.).
    emailPublico: "hola@marianadiaz.site",
    // URL de su perfil de Behance (p. ej. "https://www.behance.net/usuario"). Si está vacío, el enlace no aparece.
    behance: "",
    instagram: "",
  },
  software: ["Illustrator", "Photoshop", "InDesign", "After Effects", "Blender", "Corel Draw"],
  experiencia: [
    { empresa: "Artesano Elements", anios: "2021", rol: "Diseño gráfico" },
    { empresa: "Alphacolor", anios: "2024 – 2026", rol: "Diseño gráfico" },
    { empresa: "Maxy Sweet", anios: "2025 – 2026", rol: "Diseño gráfico" },
  ],
  servicios: [
    { id: "logo", categoria: "Branding", nombre: "Logotipo e identidad visual", detalle: "Logo, paleta, tipografías, trama y aplicaciones." },
    { id: "empaque", categoria: "Empaque", nombre: "Diseño de empaque y etiquetas", detalle: "Bolsas, latas, etiquetas técnicas y artes finales para imprenta." },
    { id: "redes", categoria: "Redes", nombre: "Contenido para redes", detalle: "Posts, campañas y retoque/integración de producto." },
    { id: "3d", categoria: "3D", nombre: "Mascota o modelado 3D", detalle: "Personajes y escenas en Blender." },
    { id: "editorial", categoria: "Editorial", nombre: "Diseño editorial", detalle: "Revistas, catálogos, álbumes y piezas impresas." },
  ],
  categorias: ["Branding", "Empaque", "Redes", "3D", "Editorial"],
  // `anio` vacío = no figura en el portafolio; se puede completar cuando ella lo confirme.
  proyectos: [
    {
      id: "flor-de-patria",
      titulo: "Café Flor de Patria",
      cliente: "Central cafetero",
      categorias: ["Branding", "Empaque"],
      anio: "",
      lema: "Más aroma, más café",
      descripcion:
        "Rebranding para la marca de café Flor de Patria, con el objetivo de modernizar su identidad gráfica manteniendo el aspecto tradicional y artesanal que la caracteriza. Diseño de logotipo, empaques, trama modular, cartel y diferentes aplicaciones de la marca.",
      herramientas: ["Illustrator", "Photoshop"],
      paleta: ["#013C32", "#106253", "#BE9E7C", "#9F5524", "#410510"],
      portada: "flor-letrero.webp",
      imagenes: ["flor-tazas.webp", "flor-gourmet.webp", "flor-clasico.webp", "flor-trama.webp", "flor-cartel.webp", "flor-campo.webp"],
    },
    {
      id: "alphacolor",
      titulo: "Alphacolor C.A.",
      cliente: "Empresa de pintura",
      categorias: ["Branding", "Empaque"],
      anio: "2024 – 2026",
      lema: "Para el pintor, está Alphacolor",
      descripcion:
        "Identidad visual integral: tarjetas de presentación, etiquetas para todas las líneas de producto, fichas técnicas de seguridad, hoja membretada, uniforme corporativo y publicidad exterior. Una paleta moderna y elementos gráficos que refuerzan el carácter profesional, innovador y llamativo de la marca.",
      herramientas: ["Illustrator", "Photoshop"],
      paleta: ["#030A29", "#729995", "#BF5683", "#CCAA50"],
      portada: "alpha-letrero.webp",
      imagenes: ["alpha-tarjetas.webp", "alpha-etiquetas.webp", "alpha-relieve.webp", "alpha-parada.webp", "alpha-camisas.webp", "alpha-carta.webp"],
    },
    {
      id: "marivalen",
      titulo: "Marivalen Studio",
      cliente: "Centro de estética",
      categorias: ["Branding"],
      anio: "",
      lema: "Transformación y belleza",
      descripcion:
        "Creación de logotipo, trama modular y empaque para una marca dedicada a la mujer. Se logró resaltar la esencia femenina y suave que la representa.",
      herramientas: ["Illustrator", "Photoshop"],
      paleta: ["#E9D4D1", "#E498A5", "#D97D93", "#7D3D5C"],
      portada: "mari-etiqueta.webp",
      imagenes: ["mari-bolsa.webp", "mari-labial.webp", "mari-crema.webp", "mari-tarjeta.webp", "mari-tarro.webp"],
    },
    {
      id: "maxy-sweet",
      titulo: "Maxy Sweet",
      cliente: "Distribuidora de confitería",
      categorias: ["Empaque", "Redes"],
      anio: "2025 – 2026",
      lema: "Líderes en distribución de confitería",
      descripcion:
        "Empaques de malvaviscos (Melou Sweet) y gomitas (Gummy Sweet) con personajes propios, y diseño de publicaciones para Instagram de toda la línea de productos.",
      herramientas: ["Illustrator", "Photoshop"],
      paleta: ["#E7AAC0", "#C26E91", "#74B65B", "#7D2663", "#233668"],
      portada: "maxy-empaques.webp",
      imagenes: ["maxy-redes.webp"],
    },
    {
      id: "artesano",
      titulo: "Artesano Elements",
      cliente: "Productos artesanales",
      categorias: ["Redes"],
      anio: "2021",
      lema: "Productos artesanales hechos con amor",
      descripcion:
        "Edición fotográfica e integración natural de los productos en ambientes para el feed de Instagram de la marca.",
      herramientas: ["Photoshop"],
      paleta: ["#EDE3D1", "#CC8E56", "#3B4A9E", "#4D4240"],
      portada: "artesano-redes.webp",
      imagenes: [],
    },
    {
      id: "chepyto",
      titulo: "Chepyto",
      cliente: "Piro Chepy · mascota 3D",
      categorias: ["3D"],
      anio: "",
      lema: "Tu amigo, Chepyto",
      descripcion:
        "Creación de mascota para una empresa de pirotecnia, pensada para conectar con los niños con un personaje infantil y amigable.",
      herramientas: ["Blender"],
      paleta: ["#1C1C1C", "#EBC973", "#6DBF4A", "#F6C64A", "#E85A9B"],
      portada: "chepyto.webp",
      imagenes: ["chepyto-saludo.webp"],
    },
    {
      id: "cabana",
      titulo: "Cabaña",
      cliente: "Proyecto universitario",
      categorias: ["3D"],
      anio: "",
      lema: "Diseño de estructura",
      descripcion:
        "Modelado completo de una estructura arquitectónica, exterior e interior: creación y distribución de espacios funcionales y realistas, con una ambientación detallada.",
      herramientas: ["Blender"],
      paleta: ["#26170C", "#36473F", "#A08A55", "#6E8FB4"],
      portada: "cabana.webp",
      imagenes: ["cabana-interior.webp", "cabana-lateral.webp"],
    },
    {
      id: "intershibuya",
      titulo: "Intershibuya",
      cliente: "Álbum de Feid · rediseño",
      categorias: ["Editorial"],
      anio: "",
      lema: "Feid desde otro ángulo",
      descripcion:
        "Rediseño del álbum Intershibuya de Feid, reinterpretando su estética para reflejar el estilo urbano y distintivo del artista y conectar visualmente con su audiencia.",
      herramientas: ["InDesign"],
      paleta: ["#0F0F0F", "#159249", "#0F4D2B", "#D9D6CF"],
      portada: "feid.webp",
      imagenes: [],
    },
  ],
};

// Servicio que corresponde a cada categoría de proyecto (para rellenar el formulario).
window.MARIANA.servicioDe = (categoria) => (window.MARIANA.servicios.find((s) => s.categoria === categoria) || {}).nombre || "";

// Tamaño real de cada imagen (ancho, alto): evita saltos de diseño mientras cargan.
window.MARIANA.dims = {"alpha-camisas.webp": [882, 696], "alpha-carta.webp": [867, 708], "alpha-etiquetas.webp": [1600, 1140], "alpha-letrero.webp": [1100, 1435], "alpha-parada.webp": [972, 483], "alpha-relieve.webp": [1100, 477], "alpha-tarjetas.webp": [1600, 516], "artesano-redes.webp": [1600, 1195], "cabana-interior.webp": [800, 859], "cabana-lateral.webp": [800, 869], "cabana.webp": [1400, 782], "chepyto-cabeza.webp": [520, 520], "chepyto-saludo.webp": [600, 1195], "chepyto.webp": [900, 1468], "feid.webp": [1400, 1490], "flor-campo.webp": [876, 261], "flor-cartel.webp": [876, 705], "flor-clasico.webp": [1000, 823], "flor-gourmet.webp": [876, 714], "flor-letrero.webp": [1100, 1373], "flor-tazas.webp": [1600, 521], "flor-trama.webp": [669, 510], "mari-bolsa.webp": [870, 1248], "mari-crema.webp": [1400, 606], "mari-etiqueta.webp": [1100, 1281], "mari-labial.webp": [1100, 977], "mari-tarjeta.webp": [999, 1002], "mari-tarro.webp": [870, 699], "maxy-empaques.webp": [1600, 1152], "maxy-redes.webp": [1600, 1198], "retrato.webp": [792, 919]};
