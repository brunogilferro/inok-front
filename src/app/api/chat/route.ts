import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

export async function POST(request: NextRequest) {
  try {
    const { message, locale = 'pt', conversationId } = await request.json();
    
    // Get auth token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    let token = null;
    if (authHeader) {
      token = authHeader.replace('Bearer ', '');
    } else if (cookieHeader) {
      // Extract token from cookies if available
      const tokenMatch = cookieHeader.match(/authToken=([^;]+)/);
      if (tokenMatch) {
        token = tokenMatch[1];
      }
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Set token for API client if available
    if (token) {
      apiClient.setToken(token);
    }

    // For now, we'll create a simple AI response
    // In a real implementation, this would connect to an AI service
    const aiResponse = generateAIResponse(message, locale);

    // If we have a conversation ID, we can add this exchange to the conversation
    if (conversationId && token) {
      try {
        // Add user message to transcript
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${conversationId}/transcript`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            speakerId: 1, // User ID (should come from JWT)
            content: message,
            confidence: 1.0,
            timestamp: new Date().toISOString(),
          }),
        });

        // Add AI response to transcript
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${conversationId}/transcript`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            speakerId: 2, // AI Agent ID
            content: aiResponse,
            confidence: 0.95,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.warn('Failed to save conversation to backend:', error);
        // Continue anyway, don't break the chat experience
      }
    }

    return NextResponse.json({
      message: aiResponse,
      timestamp: new Date().toISOString(),
      conversationId: conversationId || null,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new conversation
export async function PUT(request: NextRequest) {
  try {
    const { title, context } = await request.json();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || `Chat - ${new Date().toLocaleDateString('pt-BR')}`,
          context: context || 'Conversa de chat com assistente IA',
          narrative: 'Conversa gerada pela interface de chat',
          status: 'active',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return NextResponse.json({
          conversationId: data.data.id,
          title: data.data.title,
        });
      } else {
        throw new Error(data.message || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return NextResponse.json(
        { error: 'Failed to create conversation' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Conversation creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateAIResponse(userMessage: string, locale: string): string {
  const responses = {
    pt: {
      greeting: [
        "Olá! Sou o assistente IA do INOK. Como posso ajudá-lo hoje?",
        "Oi! Bem-vindo ao sistema INOK. Em que posso ser útil?",
        "Olá! Estou aqui para ajudar. O que você gostaria de saber?"
      ],
      help: [
        "Posso ajudá-lo com diversas tarefas no sistema INOK: gerenciar identidades, conversar sobre dados, explicar funcionalidades e muito mais!",
        "Estou aqui para auxiliar com o sistema INOK. Posso explicar funcionalidades, ajudar com dúvidas sobre identidades, conversas, agentes e outros recursos.",
        "Sou especializado no sistema INOK. Posso ajudar com questões sobre administração, explicar recursos e orientar sobre o uso da plataforma."
      ],
      admin: [
        "Para funcionalidades administrativas, você pode usar o painel admin. Lá você encontra gestão de identidades, usuários, conversas e muito mais.",
        "O sistema INOK oferece um painel administrativo completo. Você pode gerenciar agentes, bancos de dados, memórias e fluxos de dados.",
        "No painel administrativo do INOK você tem acesso a todas as funcionalidades de gestão: identidades, conversas, agentes, bases de conhecimento e usuários."
      ],
      echo: [
        `Entendi sua mensagem: "${userMessage}". Como posso ajudá-lo com isso no contexto do sistema INOK?`,
        `Sobre "${userMessage}" - posso fornecer mais informações ou ajudar de alguma forma específica?`,
        `Recebi: "${userMessage}". Tem alguma pergunta específica sobre o sistema INOK que posso responder?`
      ],
      default: [
        "Interessante pergunta! No contexto do sistema INOK, posso ajudar você a entender melhor as funcionalidades disponíveis.",
        "Vou tentar ajudar da melhor forma. O sistema INOK tem muitos recursos que podem ser úteis para sua necessidade.",
        "Ótima questão! Como assistente do INOK, posso orientá-lo sobre as melhores práticas e funcionalidades disponíveis."
      ]
    },
    en: {
      greeting: [
        "Hello! I'm the INOK AI assistant. How can I help you today?",
        "Hi! Welcome to the INOK system. How can I be useful?",
        "Hello! I'm here to help. What would you like to know?"
      ],
      help: [
        "I can help you with various INOK system tasks: managing identities, discussing data, explaining functionalities and much more!",
        "I'm here to assist with the INOK system. I can explain features, help with questions about identities, conversations, agents and other resources.",
        "I specialize in the INOK system. I can help with administration questions, explain features and guide you on platform usage."
      ],
      admin: [
        "For administrative functions, you can use the admin panel. There you'll find identity management, users, conversations and much more.",
        "The INOK system offers a complete administrative panel. You can manage agents, databases, memories and data flows.",
        "In the INOK administrative panel you have access to all management functionalities: identities, conversations, agents, knowledge bases and users."
      ],
      echo: [
        `I understood your message: "${userMessage}". How can I help you with this in the context of the INOK system?`,
        `About "${userMessage}" - can I provide more information or help in some specific way?`,
        `Received: "${userMessage}". Do you have any specific question about the INOK system I can answer?`
      ],
      default: [
        "Interesting question! In the context of the INOK system, I can help you better understand the available functionalities.",
        "I'll try to help in the best way. The INOK system has many features that might be useful for your needs.",
        "Great question! As the INOK assistant, I can guide you about best practices and available functionalities."
      ]
    },
    es: {
      greeting: [
        "¡Hola! Soy el asistente IA de INOK. ¿Cómo puedo ayudarte hoy?",
        "¡Hola! Bienvenido al sistema INOK. ¿En qué puedo ser útil?",
        "¡Hola! Estoy aquí para ayudar. ¿Qué te gustaría saber?"
      ],
      help: [
        "Puedo ayudarte con diversas tareas del sistema INOK: gestionar identidades, conversar sobre datos, explicar funcionalidades ¡y mucho más!",
        "Estoy aquí para ayudar con el sistema INOK. Puedo explicar características, ayudar con preguntas sobre identidades, conversaciones, agentes y otros recursos.",
        "Me especializo en el sistema INOK. Puedo ayudar con preguntas de administración, explicar características y orientarte sobre el uso de la plataforma."
      ],
      admin: [
        "Para funcionalidades administrativas, puedes usar el panel de administración. Allí encontrarás gestión de identidades, usuarios, conversaciones y mucho más.",
        "El sistema INOK ofrece un panel administrativo completo. Puedes gestionar agentes, bases de datos, memorias y flujos de datos.",
        "En el panel administrativo de INOK tienes acceso a todas las funcionalidades de gestión: identidades, conversaciones, agentes, bases de conocimiento y usuarios."
      ],
      echo: [
        `Entendí tu mensaje: "${userMessage}". ¿Cómo puedo ayudarte con esto en el contexto del sistema INOK?`,
        `Sobre "${userMessage}" - ¿puedo proporcionar más información o ayudar de alguna forma específica?`,
        `Recibido: "${userMessage}". ¿Tienes alguna pregunta específica sobre el sistema INOK que pueda responder?`
      ],
      default: [
        "¡Pregunta interesante! En el contexto del sistema INOK, puedo ayudarte a entender mejor las funcionalidades disponibles.",
        "Trataré de ayudar de la mejor manera. El sistema INOK tiene muchas características que podrían ser útiles para tus necesidades.",
        "¡Gran pregunta! Como asistente de INOK, puedo orientarte sobre las mejores prácticas y funcionalidades disponibles."
      ]
    }
  };

  const localeResponses = responses[locale as keyof typeof responses] || responses.en;
  const lowerMessage = userMessage.toLowerCase();
  
  // Determine response type based on message content
  let responseType = 'default';
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || 
      lowerMessage.includes('olá') || lowerMessage.includes('hola') ||
      lowerMessage.includes('oi')) {
    responseType = 'greeting';
  } else if (lowerMessage.includes('help') || lowerMessage.includes('ajuda') || 
             lowerMessage.includes('ayuda') || lowerMessage.includes('socorro')) {
    responseType = 'help';
  } else if (lowerMessage.includes('admin') || lowerMessage.includes('painel') ||
             lowerMessage.includes('panel') || lowerMessage.includes('management') ||
             lowerMessage.includes('gestão') || lowerMessage.includes('gestión')) {
    responseType = 'admin';
  } else if (lowerMessage.length > 100 || lowerMessage.includes('?')) {
    responseType = 'echo';
  }

  const responseArray = localeResponses[responseType as keyof typeof localeResponses] as string[];
  const randomIndex = Math.floor(Math.random() * responseArray.length);
  
  return responseArray[randomIndex];
}