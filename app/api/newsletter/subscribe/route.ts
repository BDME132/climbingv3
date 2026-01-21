import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }
  return new Resend(apiKey);
}

export async function POST(request: NextRequest) {
  // Rate limiting: 5 requests per minute per IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip, 5, 60000)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Validate email
    const result = subscribeSchema.safeParse(body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (!audienceId) {
      console.error("RESEND_AUDIENCE_ID not configured");
      return NextResponse.json(
        { error: "Newsletter service not configured" },
        { status: 500 }
      );
    }

    // Add contact to Resend Audience
    const resend = getResendClient();
    const { error: contactError } = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });

    if (contactError) {
      // Handle duplicate email gracefully
      if (contactError.message?.includes("already exists")) {
        return NextResponse.json(
          { error: "This email is already subscribed" },
          { status: 409 }
        );
      }
      console.error("Failed to add contact:", contactError);
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      );
    }

    // Send welcome email
    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "newsletter@resend.dev",
      to: email,
      subject: "Welcome to the Stuttgart Climbing Newsletter!",
      html: `
        <h1>Thanks for subscribing!</h1>
        <p>You'll receive the latest climbing guides, gear reviews, and training tips.</p>
        <p>No spam, just climbing content you'll love.</p>
      `,
    });

    if (emailError) {
      // Log but don't fail - contact was already added
      console.error("Failed to send welcome email:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
