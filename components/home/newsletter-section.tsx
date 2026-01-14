"use client";

import { Section, Container } from "@/components/ds";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface NewsletterSectionProps {
  title?: string;
  description?: string;
}

export const NewsletterSection = ({
  title = "Stay in the Loop",
  description = "Get the latest guides, gear reviews, and training tips delivered to your inbox. No spam, just climbing.",
}: NewsletterSectionProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setStatus("success");
    setEmail("");
  };

  return (
    <Section className="py-12 sm:py-16 bg-primary text-primary-foreground">
      <Container className="max-w-2xl text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-primary-foreground/80">{description}</p>
        </div>

        {status === "success" ? (
          <div className="p-4 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20">
            <p className="font-medium">Thanks for subscribing!</p>
            <p className="text-sm text-primary-foreground/80">
              Check your inbox for a confirmation email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1">
                <Label htmlFor="email" className="sr-only">
                  Email address
                </Label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-10 px-4 rounded-md bg-primary-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                disabled={status === "loading"}
                className="shrink-0"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>

            {status === "error" && (
              <p className="text-sm text-destructive">
                Something went wrong. Please try again.
              </p>
            )}

            <p className="text-xs text-primary-foreground/60">
              By subscribing, you agree to our privacy policy. Unsubscribe
              anytime.
            </p>
          </form>
        )}
      </Container>
    </Section>
  );
};
