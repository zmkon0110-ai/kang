import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('demo_notes')
      .select('id, content, author, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notes: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : '读取数据库失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawContent = typeof body.content === 'string' ? body.content.trim() : '';
    const rawAuthor = typeof body.author === 'string' ? body.author.trim() : '';

    if (!rawContent || rawContent.length > 500) {
      return NextResponse.json(
        { error: '内容不能为空，且长度不能超过 500 字' },
        { status: 400 }
      );
    }

    const author = (rawAuthor || '匿名访客').slice(0, 30);
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('demo_notes')
      .insert([{ content: rawContent, author }])
      .select('id, content, author, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ note: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '写入数据库失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
