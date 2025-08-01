import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, locale = 'en' } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Here you would integrate with your AI service
    // Examples:
    // - OpenAI API
    // - Anthropic Claude
    // - Google Gemini
    // - Custom AI model
    
    // Example implementation:
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant for the INOK Memory system. Respond in ${locale} language.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;
    */

    // For now, return a mock response
    const mockResponse = generateMockResponse(message, locale);

    return NextResponse.json({
      message: mockResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMockResponse(userMessage: string, locale: string): string {
  const responses = {
    en: {
      greeting: "Hello! I'm your AI assistant. How can I help you today?",
      echo: `I received your message: "${userMessage}". This is a demo response. In a real implementation, I would process your request and provide a helpful response.`,
      help: "I can help you with various tasks including answering questions, writing assistance, coding help, and much more!",
    },
    pt: {
      greeting: "Olá! Sou seu assistente de IA. Como posso ajudá-lo hoje?",
      echo: `Recebi sua mensagem: "${userMessage}". Esta é uma resposta de demonstração. Em uma implementação real, eu processaria sua solicitação e forneceria uma resposta útil.`,
      help: "Posso ajudá-lo com várias tarefas, incluindo responder perguntas, assistência na escrita, ajuda com programação e muito mais!",
    },
    es: {
      greeting: "¡Hola! Soy tu asistente de IA. ¿Cómo puedo ayudarte hoy?",
      echo: `Recibí tu mensaje: "${userMessage}". Esta es una respuesta de demostración. En una implementación real, procesaría tu solicitud y proporcionaría una respuesta útil.`,
      help: "Puedo ayudarte con varias tareas incluyendo responder preguntas, asistencia con escritura, ayuda con programación ¡y mucho más!",
    },
  };

  const localeResponses = responses[locale as keyof typeof responses] || responses.en;

  // Simple response logic based on message content
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || 
      lowerMessage.includes('olá') || lowerMessage.includes('hola')) {
    return localeResponses.greeting;
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('ajuda') || 
      lowerMessage.includes('ayuda')) {
    return localeResponses.help;
  }

  return localeResponses.echo;
}