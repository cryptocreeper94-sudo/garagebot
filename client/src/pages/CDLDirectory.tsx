import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {
  Truck, MapPin, DollarSign, Shield, Heart, Clock, Star, Search, Filter,
  Building2, GraduationCap, Phone, Globe, Mail, ChevronLeft, ChevronRight, X,
  Briefcase, Award, Fuel, Users, CheckCircle, AlertCircle, Dog, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function splitField(val: string | null | undefined): string[] {
  if (!val) return [];
  return val.split(",").map(s => s.trim()).filter(Boolean);
}

interface CdlProgram {
  id: string;
  companyName: string;
  programType: string;
  category: string;
  companyType: string;
  description: string;
  shortDescription: string;
  requirements: string;
  benefits: string;
  payRange: string;
  averageCpm: string;
  trainingLength: string;
  tuitionCost: string;
  tuitionReimbursement: boolean;
  signOnBonus: string;
  referralBonus: string;
  location: string;
  headquarters: string;
  state: string;
  operatingStates: string;
  isNationwide: boolean;
  website: string;
  applyUrl: string;
  phone: string;
  logoUrl: string;
  freightTypes: string;
  cdlClassRequired: string;
  experienceRequired: string;
  homeTime: string;
  soloTeam: string;
  hazmatRequired: boolean;
  endorsementsRequired: string;
  fleetSize: string;
  yearFounded: string;
  dotNumber: string;
  mcNumber: string;
  safetyRating: string;
  equipmentType: string;
  fuelCardProvided: boolean;
  healthInsurance: boolean;
  retirementPlan: boolean;
  paidTimeOff: boolean;
  petPolicy: boolean;
  riderPolicy: boolean;
  tags: string;
  isFeatured: boolean;
  isActive: boolean;
  isHiring: boolean;
  sortOrder: number;
}

const COMPANY_TYPES = [
  { value: "mega_carrier", label: "Mega Carrier" },
  { value: "large_carrier", label: "Large Carrier" },
  { value: "regional_carrier", label: "Regional Carrier" },
  { value: "ltl_carrier", label: "LTL Carrier" },
  { value: "specialized", label: "Specialized" },
  { value: "flatbed", label: "Flatbed" },
  { value: "tanker", label: "Tanker" },
  { value: "reefer", label: "Reefer" },
  { value: "intermodal", label: "Intermodal" },
  { value: "owner_operator", label: "Owner Operator" },
  { value: "cdl_school", label: "CDL School" },
  { value: "staffing", label: "Staffing" },
];

const EXPERIENCE_LEVELS = [
  { value: "none", label: "No Experience" },
  { value: "recent_grad", label: "Recent Graduate" },
  { value: "6_months", label: "6 Months" },
  { value: "1_year", label: "1 Year" },
  { value: "2_years", label: "2 Years" },
  { value: "5_years", label: "5+ Years" },
];

const HOME_TIME_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-Weekly" },
  { value: "regional", label: "Regional" },
  { value: "otr", label: "Over the Road" },
];

const ITEMS_PER_PAGE = 12;

function getCompanyTypeIcon(companyType: string) {
  if (companyType === "cdl_school") return GraduationCap;
  if (companyType === "staffing") return Building2;
  return Truck;
}

function getCompanyTypeLabel(value: string) {
  return COMPANY_TYPES.find((t) => t.value === value)?.label || value;
}

function getExperienceLabel(value: string) {
  return EXPERIENCE_LEVELS.find((l) => l.value === value)?.label || value;
}

function getHomeTimeLabel(value: string) {
  return HOME_TIME_OPTIONS.find((o) => o.value === value)?.label || value;
}

function FilterSidebar({
  filters,
  setFilters,
  states,
  freightTypes,
}: {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  states: string[];
  freightTypes: string[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold text-zinc-300 mb-3 block">Company Type</Label>
        <Select
          value={filters.companyType}
          onValueChange={(v) => setFilters((f) => ({ ...f, companyType: v === "all" ? "" : v, page: 1 }))}
        >
          <SelectTrigger className="bg-black/30 border-white/10" data-testid="select-company-type">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {COMPANY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-semibold text-zinc-300 mb-3 block">Experience Level</Label>
        <Select
          value={filters.experienceRequired}
          onValueChange={(v) => setFilters((f) => ({ ...f, experienceRequired: v === "all" ? "" : v, page: 1 }))}
        >
          <SelectTrigger className="bg-black/30 border-white/10" data-testid="select-experience">
            <SelectValue placeholder="Any Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Experience</SelectItem>
            {EXPERIENCE_LEVELS.map((l) => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-semibold text-zinc-300 mb-3 block">Home Time</Label>
        <Select
          value={filters.homeTime}
          onValueChange={(v) => setFilters((f) => ({ ...f, homeTime: v === "all" ? "" : v, page: 1 }))}
        >
          <SelectTrigger className="bg-black/30 border-white/10" data-testid="select-home-time">
            <SelectValue placeholder="Any Home Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Home Time</SelectItem>
            {HOME_TIME_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-semibold text-zinc-300 mb-3 block">Freight Type</Label>
        <Select
          value={filters.freightType}
          onValueChange={(v) => setFilters((f) => ({ ...f, freightType: v === "all" ? "" : v, page: 1 }))}
        >
          <SelectTrigger className="bg-black/30 border-white/10" data-testid="select-freight-type">
            <SelectValue placeholder="All Freight" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Freight</SelectItem>
            {freightTypes.map((ft) => (
              <SelectItem key={ft} value={ft}>{ft}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-semibold text-zinc-300 mb-3 block">State</Label>
        <Select
          value={filters.state}
          onValueChange={(v) => setFilters((f) => ({ ...f, state: v === "all" ? "" : v, page: 1 }))}
        >
          <SelectTrigger className="bg-black/30 border-white/10" data-testid="select-state">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-zinc-300">Has CDL Training</Label>
        <Switch
          checked={filters.hasTraining}
          onCheckedChange={(v) => setFilters((f) => ({ ...f, hasTraining: v, page: 1 }))}
          data-testid="switch-has-training"
        />
      </div>

      <Button
        variant="outline"
        className="w-full border-gray-700 text-zinc-400 hover:text-white"
        onClick={() =>
          setFilters({
            search: "",
            companyType: "",
            experienceRequired: "",
            homeTime: "",
            freightType: "",
            state: "",
            hasTraining: false,
            page: 1,
          })
        }
        data-testid="button-clear-filters"
      >
        <X className="w-4 h-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  );
}

function CompanyCard({
  company,
  onLearnMore,
  onExpressInterest,
}: {
  company: CdlProgram;
  onLearnMore: () => void;
  onExpressInterest: () => void;
}) {
  const Icon = getCompanyTypeIcon(company.companyType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      <Card
        className="glass-card card-3d hover:border-[#00D9FF]/40 transition-all duration-300 overflow-hidden group h-full flex flex-col"
        data-testid={`card-company-${company.id}`}
      >
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#00D9FF]/10 border border-[#00D9FF]/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#00D9FF]" />
              </div>
              <div className="min-w-0">
                <h3
                  className="font-bold text-white text-sm truncate group-hover:text-[#00D9FF] transition-colors"
                  data-testid={`text-company-name-${company.id}`}
                >
                  {company.companyName}
                </h3>
                <Badge
                  variant="outline"
                  className="text-[10px] border-gray-700 text-zinc-400 mt-1"
                  data-testid={`badge-company-type-${company.id}`}
                >
                  {getCompanyTypeLabel(company.companyType)}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {company.isHiring && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]" data-testid={`badge-hiring-${company.id}`}>
                  Hiring
                </Badge>
              )}
              {company.isFeatured && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]" data-testid={`badge-featured-${company.id}`}>
                  <Star className="w-3 h-3 mr-1" />Featured
                </Badge>
              )}
            </div>
          </div>

          <p className="text-xs text-zinc-400 line-clamp-2 mb-3" data-testid={`text-description-${company.id}`}>
            {company.shortDescription || company.description}
          </p>

          {company.payRange && (
            <div className="flex items-center gap-1.5 mb-3">
              <DollarSign className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-semibold text-green-400" data-testid={`text-pay-range-${company.id}`}>
                {company.payRange}
              </span>
            </div>
          )}

          {company.signOnBonus && (
            <div className="bg-[#00D9FF]/10 border border-[#00D9FF]/20 rounded-md px-2.5 py-1.5 mb-3">
              <span className="text-[10px] font-bold text-[#00D9FF]" data-testid={`text-sign-on-bonus-${company.id}`}>
                💰 Sign-On Bonus: {company.signOnBonus}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mb-3">
            {company.healthInsurance && (
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-white/5 rounded px-1.5 py-0.5">
                <Heart className="w-3 h-3 text-red-400" />Health
              </span>
            )}
            {company.retirementPlan && (
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-white/5 rounded px-1.5 py-0.5">
                <Shield className="w-3 h-3 text-blue-400" />401k
              </span>
            )}
            {company.paidTimeOff && (
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-white/5 rounded px-1.5 py-0.5">
                <Clock className="w-3 h-3 text-purple-400" />PTO
              </span>
            )}
            {company.petPolicy && (
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-white/5 rounded px-1.5 py-0.5">
                <Dog className="w-3 h-3 text-amber-400" />Pets
              </span>
            )}
            {company.riderPolicy && (
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-white/5 rounded px-1.5 py-0.5">
                <Users className="w-3 h-3 text-teal-400" />Rider
              </span>
            )}
          </div>

          {company.freightTypes && splitField(company.freightTypes).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {splitField(company.freightTypes).slice(0, 3).map((ft) => (
                <span key={ft} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-zinc-500 border border-gray-700">
                  {ft}
                </span>
              ))}
              {splitField(company.freightTypes).length > 3 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-zinc-500 border border-gray-700">
                  +{splitField(company.freightTypes).length - 3}
                </span>
              )}
            </div>
          )}

          <div className="mt-auto flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs border-gray-700 text-zinc-300 hover:border-[#00D9FF]/50 hover:text-[#00D9FF]"
              onClick={onLearnMore}
              data-testid={`button-learn-more-${company.id}`}
            >
              Learn More
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs bg-[#00D9FF] hover:bg-[#00D9FF]/80 text-black font-semibold"
              onClick={onExpressInterest}
              data-testid={`button-express-interest-${company.id}`}
            >
              Express Interest
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function CompanyDetailModal({
  company,
  open,
  onClose,
  onExpressInterest,
}: {
  company: CdlProgram | null;
  open: boolean;
  onClose: () => void;
  onExpressInterest: () => void;
}) {
  if (!company) return null;
  const Icon = getCompanyTypeIcon(company.companyType);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl glass-ultra border-white/10" data-testid="modal-company-detail">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#00D9FF]/10 border border-[#00D9FF]/20 flex items-center justify-center">
              <Icon className="w-7 h-7 text-[#00D9FF]" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white" data-testid="text-detail-company-name">
                {company.companyName}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="border-gray-700 text-zinc-400 text-xs">
                  {getCompanyTypeLabel(company.companyType)}
                </Badge>
                {company.isHiring && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Hiring</Badge>
                )}
                {company.isFeatured && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                    <Star className="w-3 h-3 mr-1" />Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <p className="text-sm text-zinc-300 leading-relaxed" data-testid="text-detail-description">
            {company.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {company.payRange && (
              <div className="glass-card rounded-lg p-3">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Pay Range</div>
                <div className="text-sm font-semibold text-green-400" data-testid="text-detail-pay">{company.payRange}</div>
              </div>
            )}
            {company.averageCpm && (
              <div className="glass-card rounded-lg p-3">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Avg CPM</div>
                <div className="text-sm font-semibold text-white">{company.averageCpm}</div>
              </div>
            )}
            {company.homeTime && (
              <div className="glass-card rounded-lg p-3">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Home Time</div>
                <div className="text-sm font-semibold text-white">{getHomeTimeLabel(company.homeTime)}</div>
              </div>
            )}
            {company.experienceRequired && (
              <div className="glass-card rounded-lg p-3">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Experience</div>
                <div className="text-sm font-semibold text-white">{getExperienceLabel(company.experienceRequired)}</div>
              </div>
            )}
            {Number(company.fleetSize) > 0 && (
              <div className="glass-card rounded-lg p-3">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Fleet Size</div>
                <div className="text-sm font-semibold text-white">{company.fleetSize.toLocaleString()}</div>
              </div>
            )}
            {Number(company.yearFounded) > 0 && (
              <div className="glass-card rounded-lg p-3">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Founded</div>
                <div className="text-sm font-semibold text-white">{company.yearFounded}</div>
              </div>
            )}
          </div>

          {company.signOnBonus && (
            <div className="bg-[#00D9FF]/10 border border-[#00D9FF]/20 rounded-lg px-4 py-3">
              <span className="text-sm font-bold text-[#00D9FF]">💰 Sign-On Bonus: {company.signOnBonus}</span>
            </div>
          )}

          {company.requirements && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Requirements</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">{company.requirements}</p>
            </div>
          )}

          {company.benefits && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Benefits</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">{company.benefits}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {company.healthInsurance && (
              <Badge variant="outline" className="border-gray-700 text-zinc-300 text-xs">
                <Heart className="w-3 h-3 mr-1 text-red-400" />Health Insurance
              </Badge>
            )}
            {company.retirementPlan && (
              <Badge variant="outline" className="border-gray-700 text-zinc-300 text-xs">
                <Shield className="w-3 h-3 mr-1 text-blue-400" />401(k)
              </Badge>
            )}
            {company.paidTimeOff && (
              <Badge variant="outline" className="border-gray-700 text-zinc-300 text-xs">
                <Clock className="w-3 h-3 mr-1 text-purple-400" />Paid Time Off
              </Badge>
            )}
            {company.petPolicy && (
              <Badge variant="outline" className="border-gray-700 text-zinc-300 text-xs">
                <Dog className="w-3 h-3 mr-1 text-amber-400" />Pet Friendly
              </Badge>
            )}
            {company.riderPolicy && (
              <Badge variant="outline" className="border-gray-700 text-zinc-300 text-xs">
                <Users className="w-3 h-3 mr-1 text-teal-400" />Rider Program
              </Badge>
            )}
            {company.fuelCardProvided && (
              <Badge variant="outline" className="border-gray-700 text-zinc-300 text-xs">
                <Fuel className="w-3 h-3 mr-1 text-orange-400" />Fuel Card
              </Badge>
            )}
            {company.tuitionReimbursement && (
              <Badge variant="outline" className="border-gray-700 text-zinc-300 text-xs">
                <GraduationCap className="w-3 h-3 mr-1 text-cyan-400" />Tuition Reimbursement
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-800">
            {company.location && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <MapPin className="w-4 h-4 text-[#00D9FF]" />
                <span>{company.location}</span>
              </div>
            )}
            {company.headquarters && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Building2 className="w-4 h-4 text-[#00D9FF]" />
                <span>HQ: {company.headquarters}</span>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Phone className="w-4 h-4 text-[#00D9FF]" />
                <span>{company.phone}</span>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Globe className="w-4 h-4 text-[#00D9FF]" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-[#00D9FF] truncate" data-testid="link-company-website">
                  {company.website}
                </a>
              </div>
            )}
            {company.dotNumber && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Award className="w-4 h-4 text-zinc-500" />
                <span>DOT# {company.dotNumber}</span>
              </div>
            )}
            {company.mcNumber && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Award className="w-4 h-4 text-zinc-500" />
                <span>MC# {company.mcNumber}</span>
              </div>
            )}
            {company.safetyRating && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Safety: {company.safetyRating}</span>
              </div>
            )}
            {company.equipmentType && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Truck className="w-4 h-4 text-zinc-500" />
                <span>{company.equipmentType}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 bg-[#00D9FF] hover:bg-[#00D9FF]/80 text-black font-semibold"
              onClick={onExpressInterest}
              data-testid="button-detail-express-interest"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Express Interest
            </Button>
            {company.applyUrl && (
              <Button
                variant="outline"
                className="border-[#00D9FF]/30 text-[#00D9FF] hover:bg-[#00D9FF]/10"
                asChild
              >
                <a href={company.applyUrl} target="_blank" rel="noopener noreferrer" data-testid="link-apply-now">
                  <Globe className="w-4 h-4 mr-2" />
                  Apply Direct
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InterestFormModal({
  company,
  open,
  onClose,
}: {
  company: CdlProgram | null;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    cdlClassInterest: "",
    experience: "",
    message: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof form & { programId: string }) => {
      const res = await apiRequest("POST", "/api/cdl-directory/interest", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Interest Submitted!", description: `Your interest in ${company?.companyName} has been sent.` });
      setForm({ fullName: "", email: "", phone: "", location: "", cdlClassInterest: "", experience: "", message: "" });
      onClose();
    },
    onError: () => {
      toast({ title: "Submission Failed", description: "Please try again later.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    if (!form.fullName || !form.email) {
      toast({ title: "Required Fields", description: "Please fill in your name and email.", variant: "destructive" });
      return;
    }
    mutation.mutate({ ...form, programId: company.id });
  };

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md glass-ultra border-white/10" data-testid="modal-interest-form">
        <DialogHeader>
          <DialogTitle className="text-white">Express Interest</DialogTitle>
          <p className="text-sm text-zinc-400 mt-1">
            Interested in <span className="text-[#00D9FF] font-semibold">{company.companyName}</span>? Fill out the form below.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-xs text-zinc-400">Full Name *</Label>
            <Input
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder="John Doe"
              className="bg-black/30 border-white/10 focus:border-primary/50 mt-1"
              required
              data-testid="input-interest-name"
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400">Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="john@example.com"
              className="bg-black/30 border-white/10 focus:border-primary/50 mt-1"
              required
              data-testid="input-interest-email"
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400">Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="(555) 123-4567"
              className="bg-black/30 border-white/10 focus:border-primary/50 mt-1"
              data-testid="input-interest-phone"
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400">Location</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="City, State"
              className="bg-black/30 border-white/10 focus:border-primary/50 mt-1"
              data-testid="input-interest-location"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-400">CDL Class Interest</Label>
              <Select
                value={form.cdlClassInterest}
                onValueChange={(v) => setForm((f) => ({ ...f, cdlClassInterest: v }))}
              >
                <SelectTrigger className="bg-black/30 border-white/10 mt-1" data-testid="select-interest-cdl-class">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Class A</SelectItem>
                  <SelectItem value="B">Class B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Experience</Label>
              <Select
                value={form.experience}
                onValueChange={(v) => setForm((f) => ({ ...f, experience: v }))}
              >
                <SelectTrigger className="bg-black/30 border-white/10 mt-1" data-testid="select-interest-experience">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-zinc-400">Message</Label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Tell us about yourself and your interest..."
              className="bg-black/30 border-white/10 focus:border-primary/50 mt-1 min-h-[80px]"
              data-testid="textarea-interest-message"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/80 text-black font-semibold"
            disabled={mutation.isPending}
            data-testid="button-submit-interest"
          >
            {mutation.isPending ? "Submitting..." : "Submit Interest"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8" data-testid="pagination">
      <Button
        variant="outline"
        size="icon"
        className="w-9 h-9 border-gray-700 text-zinc-400 hover:text-white disabled:opacity-30"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        data-testid="button-prev-page"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      {pages.map((p, i) =>
        typeof p === "string" ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-zinc-600 text-sm">
            ...
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            className={`w-9 h-9 text-sm ${
              p === page
                ? "bg-[#00D9FF] text-black hover:bg-[#00D9FF]/80"
                : "border-gray-700 text-zinc-400 hover:text-white"
            }`}
            onClick={() => onPageChange(p)}
            data-testid={`button-page-${p}`}
          >
            {p}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="icon"
        className="w-9 h-9 border-gray-700 text-zinc-400 hover:text-white disabled:opacity-30"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        data-testid="button-next-page"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface FilterState {
  search: string;
  companyType: string;
  experienceRequired: string;
  homeTime: string;
  freightType: string;
  state: string;
  hasTraining: boolean;
  page: number;
}

export default function CDLDirectory() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    companyType: "",
    experienceRequired: "",
    homeTime: "",
    freightType: "",
    state: "",
    hasTraining: false,
    page: 1,
  });
  const [selectedCompany, setSelectedCompany] = useState<CdlProgram | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [interestOpen, setInterestOpen] = useState(false);
  const [interestCompany, setInterestCompany] = useState<CdlProgram | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: stats } = useQuery<{ totalCompanies: number; totalHiring: number; categoryCounts: any; companyTypeCounts: any }>({
    queryKey: ["/api/cdl-directory/stats"],
  });

  const { data: statesData } = useQuery<string[]>({
    queryKey: ["/api/cdl-directory/states"],
  });

  const { data: categoriesData } = useQuery<{
    categories: string[];
    companyTypes: string[];
    freightTypes: string[];
    experienceLevels: string[];
    homeTimeOptions: string[];
  }>({
    queryKey: ["/api/cdl-directory/categories"],
  });

  const searchParams = new URLSearchParams();
  if (filters.search) searchParams.set("search", filters.search);
  if (filters.companyType) searchParams.set("companyType", filters.companyType);
  if (filters.experienceRequired) searchParams.set("experienceRequired", filters.experienceRequired);
  if (filters.homeTime) searchParams.set("homeTime", filters.homeTime);
  if (filters.freightType) searchParams.set("freightType", filters.freightType);
  if (filters.state) searchParams.set("state", filters.state);
  if (filters.hasTraining) searchParams.set("hasTraining", "true");
  searchParams.set("limit", String(ITEMS_PER_PAGE));
  searchParams.set("offset", String((filters.page - 1) * ITEMS_PER_PAGE));

  const { data: searchData, isLoading } = useQuery<{ results: CdlProgram[]; total: number }>({
    queryKey: ["/api/cdl-directory/search", searchParams.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/cdl-directory/search?${searchParams.toString()}`, { credentials: "include" });
      if (!res.ok) return { results: [], total: 0 };
      return res.json();
    },
  });

  const results = searchData?.results || [];
  const total = searchData?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const freightTypes = categoriesData?.freightTypes || [];
  const states = statesData || [];

  const openDetail = (company: CdlProgram) => {
    setSelectedCompany(company);
    setDetailOpen(true);
  };

  const openInterest = (company: CdlProgram) => {
    setInterestCompany(company);
    setInterestOpen(true);
  };

  const activeFilterCount = [
    filters.companyType,
    filters.experienceRequired,
    filters.homeTime,
    filters.freightType,
    filters.state,
    filters.hasTraining ? "yes" : "",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Nav />
      <div className="pt-[50px]">
      <section className="relative overflow-hidden pt-16 pb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/10 via-transparent to-cyan-500/5" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#00D9FF]/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-full text-[#00D9FF] text-sm mb-6"
            >
              <Truck className="w-4 h-4" />
              CDL & Trucking Directory
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-bold text-white mb-4"
              data-testid="text-page-title"
            >
              CDL & Trucking Company
              <br />
              <span className="bg-gradient-to-r from-[#00D9FF] via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Directory
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8"
              data-testid="text-page-subtitle"
            >
              Find the best trucking companies, CDL schools, and career opportunities.
              Compare pay, benefits, home time, and more.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto"
            >
              <div className="text-center p-3 glass-card rounded-xl">
                <Building2 className="w-5 h-5 text-[#00D9FF] mx-auto mb-1" />
                <div className="text-xl font-bold text-white" data-testid="text-stat-total-companies">
                  {stats?.totalCompanies ?? "—"}
                </div>
                <div className="text-[10px] text-zinc-500">Total Companies</div>
              </div>
              <div className="text-center p-3 glass-card rounded-xl">
                <Briefcase className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-green-400" data-testid="text-stat-hiring">
                  {stats?.totalHiring ?? "—"}
                </div>
                <div className="text-[10px] text-zinc-500">Currently Hiring</div>
              </div>
              <div className="text-center p-3 glass-card rounded-xl">
                <GraduationCap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-amber-400" data-testid="text-stat-schools">
                  {stats?.companyTypeCounts?.cdl_school ?? "—"}
                </div>
                <div className="text-[10px] text-zinc-500">CDL Schools</div>
              </div>
              <div className="text-center p-3 glass-card rounded-xl">
                <MapPin className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-purple-400" data-testid="text-stat-states">
                  {states.length || "—"}
                </div>
                <div className="text-[10px] text-zinc-500">States Covered</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative max-w-2xl mx-auto"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
            placeholder="Search companies, CDL schools, freight types..."
            className="pl-12 h-12 bg-black/30 border-white/10 focus:border-primary/50 text-base backdrop-blur"
            data-testid="input-search"
          />
          {filters.search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              onClick={() => setFilters((f) => ({ ...f, search: "", page: 1 }))}
              data-testid="button-clear-search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-4 glass-ultra rounded-xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <Filter className="w-4 h-4 text-[#00D9FF]" />
                <h3 className="text-sm font-semibold text-white">Filters</h3>
                {activeFilterCount > 0 && (
                  <Badge className="bg-[#00D9FF]/20 text-[#00D9FF] border-[#00D9FF]/30 text-[10px] ml-auto">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                states={states}
                freightTypes={freightTypes}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-gray-700 text-zinc-300"
                    data-testid="button-mobile-filters"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="bg-[#00D9FF]/20 text-[#00D9FF] border-[#00D9FF]/30 text-[10px] ml-2">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="glass-ultra border-white/10 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="text-white flex items-center gap-2">
                      <Filter className="w-4 h-4 text-[#00D9FF]" />
                      Filters
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar
                      filters={filters}
                      setFilters={setFilters}
                      states={states}
                      freightTypes={freightTypes}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <span className="text-xs text-zinc-500" data-testid="text-result-count">
                {total} result{total !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="hidden lg:flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-400" data-testid="text-result-count-desktop">
                Showing {results.length} of {total} companies
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-800 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-800 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-3 bg-gray-800 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-800 rounded w-2/3 mb-4" />
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-800 rounded flex-1" />
                      <div className="h-8 bg-gray-800 rounded flex-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
                data-testid="empty-state"
              >
                <div className="w-20 h-20 rounded-full glass-card flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-zinc-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Companies Found</h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
                  No companies match your current filters. Try adjusting your search criteria or clearing filters.
                </p>
                <Button
                  variant="outline"
                  className="border-[#00D9FF]/30 text-[#00D9FF] hover:bg-[#00D9FF]/10"
                  onClick={() =>
                    setFilters({
                      search: "",
                      companyType: "",
                      experienceRequired: "",
                      homeTime: "",
                      freightType: "",
                      state: "",
                      hasTraining: false,
                      page: 1,
                    })
                  }
                  data-testid="button-clear-all-filters"
                >
                  Clear All Filters
                </Button>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {results.map((company) => (
                      <CompanyCard
                        key={company.id}
                        company={company}
                        onLearnMore={() => openDetail(company)}
                        onExpressInterest={() => openInterest(company)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                <Pagination
                  page={filters.page}
                  totalPages={totalPages}
                  onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
                />
              </>
            )}
          </div>
        </div>
      </section>

      <CompanyDetailModal
        company={selectedCompany}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onExpressInterest={() => {
          setDetailOpen(false);
          if (selectedCompany) openInterest(selectedCompany);
        }}
      />

      <InterestFormModal
        company={interestCompany}
        open={interestOpen}
        onClose={() => setInterestOpen(false)}
      />
      </div>
      <Footer />
    </div>
  );
}
