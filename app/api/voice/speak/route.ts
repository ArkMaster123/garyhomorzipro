import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    // Call VibeVoice API for text-to-speech
    const vibevoiceResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "microsoft/VibeVoice-1.5B:da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
        input: {
          text: text,
          speaker_id: 0, // Default speaker
          language: "en",
          speed: 1.0,
        }
      }),
    });

    if (!vibevoiceResponse.ok) {
      const error = await vibevoiceResponse.text();
      console.error('VibeVoice API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate speech from VibeVoice API' },
        { status: 500 }
      );
    }

    const prediction = await vibevoiceResponse.json();
    
    // Poll for completion
    let audioUrl = null;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max wait
    
    while (attempts < maxAttempts) {
      const statusResponse = await fetch(prediction.urls.get, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });
      
      if (!statusResponse.ok) {
        throw new Error('Failed to check prediction status');
      }
      
      const status = await statusResponse.json();
      
      if (status.status === 'succeeded') {
        audioUrl = status.output;
        break;
      } else if (status.status === 'failed') {
        throw new Error('Speech generation failed');
      }
      
      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
    
    if (!audioUrl) {
      throw new Error('Speech generation timed out');
    }

    // Download the audio file
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to download generated audio');
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    
    // Return the audio as a blob
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Text-to-speech error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
