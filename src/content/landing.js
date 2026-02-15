const defaultWhatsAppNumber = "5519971610189";
const defaultWhatsAppMessage =
  "Olá! Quero agendar uma aula experimental no CT Mão de Pedra.";

export const landingContent = {
  brand: {
    name: "MÃO DE PEDRA",
    tagline: "Centro de Treinamento de Muay Thai",
    values: "Força • Disciplina • Respeito",
  },
  nav: {
    items: [
      { label: "Início", href: "#inicio" },
      { label: "Sobre", href: "#sobre" },
      { label: "CT em Ação", href: "#galeria" },
      { label: "Benefícios", href: "#beneficios" },
    ],
    ctaLabel: "Agende Agora",
  },
  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? defaultWhatsAppNumber,
    message: process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ?? defaultWhatsAppMessage,
  },
  hero: {
    headline: "MÃO DE PEDRA",
    subheadline: "Centro de Treinamento de Muay Thai",
    highlight: "Força • Disciplina • Respeito",
    primaryCta: "Agende Sua Aula Experimental",
    // Optional: place an image in `public/images/hero.jpg` to match the Figma.
    backgroundImage: "/images/hero.jpg",
  },
  welcome: {
    id: "sobre",
    title: "Bem-vindo ao Mão de Pedra",
    description:
      "Há mais de 6 anos formando atletas e transformando vidas através do Muay Thai. Nosso CT oferece uma infraestrutura moderna e uma metodologia de treino completa.",
    cards: [
      {
        title: "Tradição Autêntica",
        description:
          "Treinamento baseado nas técnicas tradicionais do Muay Thai tailandês.",
        icon: "shield",
      },
      {
        title: "Instrutores Certificados",
        description: "Equipe com certificação e experiência em competições.",
        icon: "trophy",
      },
      {
        title: "Comunidade Unida",
        description:
          "Ambiente acolhedor para todos os níveis, do iniciante ao avançado.",
        icon: "users",
      },
      {
        title: "Transformação Completa",
        description:
          "Desenvolvimento físico, mental e emocional através da arte marcial.",
        icon: "heart",
      },
    ],
  },
  benefits: {
    id: "beneficios",
    title: "Benefícios do Muay Thai",
    description:
      "Transforme seu corpo e sua mente com a arte marcial mais completa do mundo.",
    cards: [
      {
        title: "Condicionamento Físico",
        description: "Melhora da força, resistência e flexibilidade.",
        icon: "fitness",
      },
      {
        title: "Desenvolvimento Mental",
        description: "Foco, disciplina e controle emocional.",
        icon: "brain",
      },
      {
        title: "Defesa Pessoal",
        description: "Técnicas efetivas para proteção pessoal.",
        icon: "target",
      },
      {
        title: "Autoconfiança",
        description: "Mais segurança e postura no dia a dia.",
        icon: "spark",
      },
      {
        title: "Disciplina",
        description: "Rotina, constância e evolução contínua.",
        icon: "check",
      },
      {
        title: "Energia e Bem-estar",
        description: "Alívio do estresse e melhora do humor.",
        icon: "bolt",
      },
    ],
  },
  gallery: {
    id: "galeria",
    title: "Nosso CT em Ação",
    description:
      "Muay Thai é pra todos: do iniciante ao avançado, para kids, mulheres e homens. Conheça nossa estrutura e veja a energia dos treinos no Mão de Pedra. Vem treinar com a gente!",
    items: [
      {
        title: "",
        kind: "video",
        src: "/videos/video-01.mp4",
      },
      {
        title: "",
        kind: "video",
        src: "/videos/video-02.mp4",
      },
      {
        title: "",
        kind: "video",
        src: "/videos/video-03.mp4",
      },
    ],
  },
  finalCta: {
    title: "Pronto para treinar de verdade?",
    description:
      "Fale com a gente no WhatsApp e agende sua aula experimental. Venha sentir na prática a energia do Mão de Pedra.",
    cta: "Agendar no WhatsApp",
  },
  footer: {
    description:
      "Transforme corpo e mente através do Muay Thai. Tradição, disciplina e evolução em um ambiente acolhedor.",
    socials: [
      {
        label: "Instagram",
        href: "https://instagram.com/ctmaodepedrainfight/",
        icon: "instagram",
      },
      { label: "Facebook", href: "#", icon: "facebook" },
      // { label: "YouTube", href: "#", icon: "youtube" },
    ],
    quickLinks: [
      { label: "Início", href: "#inicio" },
      { label: "Sobre", href: "#sobre" },
      { label: "Benefícios", href: "#beneficios" },
      { label: "Galeria", href: "#galeria" },
      { label: "Agendar", href: "#final-cta" },
    ],
    contact: {
      email: "contato@maodepedra.com",
      whatsappLabel: "WhatsApp",
      // If you later want a different number/message just for footer, we can split config.
    },
    legalLinks: [
      { label: "Política de Privacidade", href: "#" },
      { label: "Termos de Uso", href: "#" },
    ],
  },
};
