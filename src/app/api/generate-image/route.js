import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

async function query(params) {
  const {
    prompt,
    negativePrompt = "",
    width = 1024,
    height = 1024,
    steps = 30,
    seed = -1,
    guidanceScale = 7.5
  } = params;

  const response = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large",
    {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: negativePrompt,
          width: parseInt(width),
          height: parseInt(height),
          num_inference_steps: parseInt(steps),
          guidance_scale: parseFloat(guidanceScale),
          seed: parseInt(seed)
        }
      }),
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to generate image');
  }
  
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:image/jpeg;base64,${base64}`;
}

export async function POST(req) {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const params = await req.json();
    const imageData = await query(params);
    
    return NextResponse.json({ imageUrl: imageData });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}