import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { FileText, DollarSign, ShieldCheck, Link2, ExternalLink, Heart, ChevronLeft } from "lucide-react";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function AffiliateDisclosure() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/20">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-tech font-bold uppercase text-primary" data-testid="heading-affiliate-disclosure">Affiliate Disclosure</h1>
              <p className="text-muted-foreground text-sm font-mono">Last Updated: February 2026</p>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            DarkWave Studios LLC
          </Badge>
        </motion.div>

        <div className="space-y-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
            <Card className="p-6 bg-card/50">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-tech uppercase mb-3">FTC Disclosure</h2>
                  <div className="space-y-3 text-muted-foreground" data-testid="text-ftc-disclosure">
                    <p>In accordance with the Federal Trade Commission's guidelines concerning the use of endorsements and testimonials in advertising (16 CFR Part 255), GarageBot makes the following disclosures:</p>
                    <p>GarageBot is operated by <strong className="text-foreground">DarkWave Studios LLC</strong>. This website contains affiliate links, which means we may earn a commission if you click on a link and make a purchase. <strong className="text-foreground">This comes at no additional cost to you.</strong></p>
                    <p>We only recommend products and services that we believe will add value to our users. Our affiliate relationships do not influence the prices you pay — all prices displayed on GarageBot are real-time prices pulled directly from the retailers themselves.</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
            <Card className="p-6 bg-card/50">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-tech uppercase mb-3">Affiliate Networks</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>GarageBot participates in the following affiliate programs and networks:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4" data-testid="list-affiliate-networks">
                      <li><strong className="text-foreground">Amazon Associates</strong> — Amazon's official affiliate program</li>
                      <li><strong className="text-foreground">eBay Partner Network</strong> — eBay's affiliate marketplace</li>
                      <li><strong className="text-foreground">CJ Affiliate</strong> — Commission Junction performance marketing network</li>
                      <li><strong className="text-foreground">ShareASale</strong> — Affiliate marketing network for merchants and publishers (GARVEE)</li>
                      <li><strong className="text-foreground">Impact Radius</strong> — Partnership automation platform</li>
                      <li><strong className="text-foreground">AvantLink</strong> — Technology-driven affiliate marketing network</li>
                      <li><strong className="text-foreground">FlexOffers</strong> — Digital publisher monetization platform</li>
                      <li><strong className="text-foreground">Awin</strong> — Global affiliate marketing network (OEDRO)</li>
                    </ul>
                    <p>We may add or remove affiliate partners at any time. This page will be updated accordingly.</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
            <Card className="p-6 bg-card/50">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Link2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-tech uppercase mb-3">Pricing Transparency</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>GarageBot is a price comparison and parts aggregation platform. We want you to know:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>All prices shown on GarageBot are <strong className="text-foreground">real-time prices</strong> pulled directly from retailer websites and APIs</li>
                      <li>We do <strong className="text-foreground">not inflate prices</strong> — the price you see on GarageBot is the same price listed on the retailer's own site</li>
                      <li>Our commission is paid by the retailer, not by you</li>
                      <li>We aggregate pricing from 58+ retailers to help you find the best deal</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
            <Card className="p-6 bg-card/50">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <ExternalLink className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-tech uppercase mb-3">Identifying Affiliate Links</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>GarageBot makes it easy for you to identify affiliate links:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Product listings with a <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs mx-1">LIVE</Badge> badge indicate real-time pricing from affiliate retailers</li>
                      <li>Clicking a product link will take you to the retailer's website where you can complete your purchase</li>
                      <li>Any link that directs you to an external retailer site is an affiliate link</li>
                      <li>We clearly label external links with an external link icon where applicable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
            <Card className="p-6 bg-card/50">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Heart className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-tech uppercase mb-3">Editorial Independence</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>Our editorial content, including product recommendations, search results, rankings, and reviews, is <strong className="text-foreground">independent of our affiliate relationships</strong>.</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Affiliate partnerships do not influence which products appear in search results</li>
                      <li>Our Buddy AI assistant provides unbiased recommendations based on fitment and user needs</li>
                      <li>We do not accept payment from retailers to feature or prioritize their products</li>
                      <li>DIY guides and repair content are created independently and are not sponsored</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
            <Card className="p-6 bg-card/50 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-tech uppercase mb-3">Contact Us</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>If you have questions about our affiliate relationships or this disclosure, please contact us:</p>
                    <p>Email: <a href="mailto:support@garagebot.io" className="text-primary hover:underline">support@garagebot.io</a></p>
                    <p className="text-sm mt-4">GarageBot is operated by <strong className="text-foreground">DarkWave Studios LLC</strong>.</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
