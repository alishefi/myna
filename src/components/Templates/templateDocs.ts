import {
  Briefcase,
  Mail,
  Receipt,
  FileSpreadsheet,
  NotebookPen,
  ClipboardList,
  Building2,
  Megaphone,
  FileSignature,
  Home,
  Lock,
  Heart,
  PartyPopper,
  CalendarDays,
  CalendarRange,
  BookOpen,
  ChefHat,
  Plane,
  Dumbbell,
  GraduationCap,
} from "lucide-react"

interface PMNode {
  type: string
  attrs?: Record<string, unknown>
  content?: PMNode[]
  marks?: { type: string }[]
  text?: string
}

function text(value: string, bold = false): PMNode {
  return { type: "text", text: value, marks: bold ? [{ type: "bold" }] : undefined }
}
function p(align: "left" | "center" | "right" = "left", ...runs: PMNode[]): PMNode {
  return { type: "paragraph", attrs: { textAlign: align }, content: runs.length ? runs : undefined }
}
function h(level: 1 | 2 | 3, align: "left" | "center" | "right" = "left", value = ""): PMNode {
  return { type: "heading", attrs: { level, textAlign: align }, content: value ? [text(value)] : undefined }
}
function hr(): PMNode {
  return { type: "horizontalRule" }
}
function cell(node: PMNode, header = false): PMNode {
  return { type: header ? "tableHeader" : "tableCell", content: [node] }
}
function row(...cells: PMNode[]): PMNode {
  return { type: "tableRow", content: cells }
}
function table(...rows: PMNode[]): PMNode {
  return { type: "table", content: rows }
}
function doc(...blocks: PMNode[]): { type: "doc"; content: PMNode[] } {
  return { type: "doc", content: blocks }
}
function bullets(...items: string[]): PMNode {
  return { type: "bulletList", content: items.map((i) => ({ type: "listItem", content: [p("left", text(i))] })) }
}

export interface DocTemplate {
  key: string
  name: string
  description: string
  icon: typeof Briefcase
  content: ReturnType<typeof doc>
}

export const docTemplates: DocTemplate[] = [
  {
    key: "resume",
    name: "Resume",
    description: "Contact info, experience, education, and skills.",
    icon: Briefcase,
    content: doc(
      h(1, "left", "Amelia Carter"),
      p("left", text("amelia.carter@email.com · (555) 012-3456 · Denver, CO · linkedin.com/in/ameliacarter")),
      hr(),
      h(2, "left", "Summary"),
      p("left", text("Product designer with 6+ years of experience leading end-to-end design for B2B SaaS products, from research to high-fidelity prototypes.")),
      h(2, "left", "Experience"),
      table(
        row(cell(p("left", text("Brightline Co. — Senior Product Designer")), true), cell(p("right", text("2021 — Present")), true)),
        row(cell(p("left", text("Led design for the onboarding flow, increasing activation by 24%. Mentored two junior designers."))), cell(p()))
      ),
      table(
        row(cell(p("left", text("Northstar Studio — Product Designer")), true), cell(p("right", text("2018 — 2021")), true)),
        row(cell(p("left", text("Designed and shipped 12+ features across web and mobile for a logistics platform."))), cell(p()))
      ),
      h(2, "left", "Education"),
      p("left", text("B.A. in Graphic Design — Rhode Island School of Design, 2018")),
      h(2, "left", "Skills"),
      p("left", text("Figma · Design systems · User research · Prototyping · HTML/CSS"))
    ),
  },
  {
    key: "cover-letter",
    name: "Cover Letter",
    description: "A warm, professional letter to accompany a job application.",
    icon: Mail,
    content: doc(
      p("left", text("Amelia Carter")),
      p("left", text("May 10, 2026")),
      hr(),
      p("left", text("Dear Hiring Manager,")),
      p(
        "left",
        text(
          "I'm writing to apply for the Senior Product Designer role at Lumen. Over the past six years, I've led design for B2B products end-to-end — from early research through shipped, measurable features — and I'd love to bring that experience to your team."
        )
      ),
      p(
        "left",
        text(
          "At Brightline, I redesigned our onboarding flow, which increased activation by 24% within a quarter. I'm especially drawn to Lumen's focus on accessibility, which has been a throughline in my own work."
        )
      ),
      p("left", text("I'd welcome the chance to talk more about how I can contribute. Thank you for your time and consideration.")),
      p("left", text("Sincerely,")),
      p("left", text("Amelia Carter"))
    ),
  },
  {
    key: "invoice",
    name: "Invoice",
    description: "Billing details, line items, totals, and payment info.",
    icon: Receipt,
    content: doc(
      table(row(cell(h(2, "left", "Innovus Tech")), cell(h(2, "right", "Invoice")))),
      hr(),
      table(
        row(
          cell(p("left", text("Invoice #: ", true), text("INV-2024-052"))),
          cell(p("center", text("Date: ", true), text("Sep 14, 2024"))),
          cell(p("right", text("Due: ", true), text("Sep 21, 2024")))
        )
      ),
      hr(),
      table(row(cell(p("left", text("Billed to: ", true), text("Nike Inc., One Way Blvd, Los Angeles, CA"))))),
      hr(),
      table(
        row(cell(p("left", text("Description")), true), cell(p("right", text("Qty")), true), cell(p("right", text("Rate")), true), cell(p("right", text("Total")), true)),
        row(cell(p("left", text("Website Design"))), cell(p("right", text("1"))), cell(p("right", text("$500"))), cell(p("right", text("$500")))),
        row(cell(p("left", text("Website Development"))), cell(p("right", text("1"))), cell(p("right", text("$1,200"))), cell(p("right", text("$1,200")))),
        row(cell(p("left", text("UX Copywriting"))), cell(p("right", text("1"))), cell(p("right", text("$300"))), cell(p("right", text("$300"))))
      ),
      hr(),
      table(
        row(cell(p("right", text("Subtotal:", true))), cell(p("right", text("$2,000")))),
        row(cell(p("right", text("Tax (9%):", true))), cell(p("right", text("$180")))),
        row(cell(p("right", text("Total Due:", true))), cell(p("right", text("$2,180", true))))
      ),
      hr(),
      p("left", text("Payment Method: ", true), text("Bank transfer · Acc #5010100682047 · Union Bank"))
    ),
  },
  {
    key: "quotation",
    name: "Quotation",
    description: "A bold price quote with itemized costs and totals.",
    icon: FileSpreadsheet,
    content: doc(
      p("center", text("Architecture Analysis & Oversight")),
      h(1, "center", "Quotation"),
      hr(),
      table(
        row(cell(p("left", text("Date: ", true), text("10/05/25"))), cell(p("center", text("Valid until: ", true), text("15/05/25"))), cell(p("right", text("Quote #: ", true), text("5556667"))))
      ),
      hr(),
      table(row(cell(p("left", text("To: ", true), text("Johnny & Betty Gibbins"))), cell(p("right", text("321 Rodeo Dr, Old Rochelle, NY 90210"))))),
      hr(),
      table(
        row(cell(p("left", text("Item Description")), true), cell(p("right", text("Price")), true), cell(p("right", text("Qty")), true), cell(p("right", text("Amount")), true)),
        row(cell(p("left", text("Architectural design"))), cell(p("right", text("$2,000"))), cell(p("right", text("1"))), cell(p("right", text("$2,000")))),
        row(cell(p("left", text("Schematic design"))), cell(p("right", text("$5,000"))), cell(p("right", text("1"))), cell(p("right", text("$5,000")))),
        row(cell(p("left", text("Construction documents"))), cell(p("right", text("$10,000"))), cell(p("right", text("1"))), cell(p("right", text("$10,000"))))
      ),
      hr(),
      table(
        row(cell(p("right", text("Subtotal:", true))), cell(p("right", text("$17,000")))),
        row(cell(p("right", text("Tax (9%):", true))), cell(p("right", text("$1,530")))),
        row(cell(p("right", text("Total Due:", true))), cell(p("right", text("$18,530", true))))
      ),
      hr(),
      p("left", text("Designhaus Architecture & Design", true)),
      p("left", text("123 Creative Lane, New York, NY 10001 · (123) 456-7890"))
    ),
  },
  {
    key: "receipt",
    name: "Receipt",
    description: "A simple proof-of-payment slip for goods or services.",
    icon: Receipt,
    content: doc(
      h(2, "center", "Receipt"),
      table(row(cell(p("left", text("Received from: ", true), text("Maria Lopez"))), cell(p("right", text("Date: ", true), text("Jun 27, 2026"))))),
      table(
        row(cell(p("left", text("Item")), true), cell(p("right", text("Amount")), true)),
        row(cell(p("left", text("Consultation session"))), cell(p("right", text("$80")))),
        row(cell(p("left", text("Materials"))), cell(p("right", text("$25"))))
      ),
      hr(),
      table(row(cell(p("right", text("Total Paid:", true))), cell(p("right", text("$105", true))))),
      p("left", text("Payment method: Cash"))
    ),
  },
  {
    key: "meeting-notes",
    name: "Meeting Notes",
    description: "Attendees, agenda, decisions, and action items in one place.",
    icon: NotebookPen,
    content: doc(
      h(1, "left", "Q3 Roadmap Sync"),
      p("left", text("Date: Jun 27, 2026 · Attendees: Sam, Priya, Wes")),
      hr(),
      h(2, "left", "Agenda"),
      bullets("Review Q2 results", "Prioritize Q3 roadmap items", "Discuss hiring plan"),
      h(2, "left", "Decisions"),
      bullets("Ship the redesigned dashboard by end of July", "Pause the mobile app project until Q4"),
      h(2, "left", "Action items"),
      bullets("Sam to draft the Q3 roadmap doc by Friday", "Priya to schedule design review", "Wes to post the open role")
    ),
  },
  {
    key: "project-proposal",
    name: "Project Proposal",
    description: "Pitch a project with goals, scope, timeline, and budget.",
    icon: ClipboardList,
    content: doc(
      h(1, "left", "Website Redesign Proposal"),
      p("left", text("Prepared for: Northwind Co. · Prepared by: Studio Lane · Jun 27, 2026")),
      hr(),
      h(2, "left", "Overview"),
      p("left", text("Northwind's current site has a 68% bounce rate on mobile. This proposal outlines a redesign focused on speed, clarity, and conversion.")),
      h(2, "left", "Goals"),
      bullets("Reduce mobile bounce rate below 40%", "Increase newsletter signups by 2x", "Modernize the visual identity"),
      h(2, "left", "Scope & Timeline"),
      table(
        row(cell(p("left", text("Phase")), true), cell(p("right", text("Timeline")), true)),
        row(cell(p("left", text("Discovery & wireframes"))), cell(p("right", text("2 weeks")))),
        row(cell(p("left", text("Visual design"))), cell(p("right", text("3 weeks")))),
        row(cell(p("left", text("Development & QA"))), cell(p("right", text("4 weeks"))))
      ),
      h(2, "left", "Budget"),
      p("left", text("$14,500 total, billed in three milestones."))
    ),
  },
  {
    key: "business-one-pager",
    name: "Business One-Pager",
    description: "A single-page snapshot of your business for investors or partners.",
    icon: Building2,
    content: doc(
      h(1, "left", "Loop — Inventory for small retailers"),
      p("left", text("Real-time stock tracking without the spreadsheet chaos.")),
      hr(),
      h(2, "left", "Problem"),
      p("left", text("Small retailers lose an estimated 8% of revenue annually to stockouts and overordering caused by manual inventory tracking.")),
      h(2, "left", "Solution"),
      p("left", text("Loop syncs inventory across POS, online store, and warehouse in real time, with automatic reorder alerts.")),
      h(2, "left", "Market"),
      p("left", text("4.2M independent retailers in the US alone; $1.8B addressable market for inventory software.")),
      h(2, "left", "Traction"),
      p("left", text("120 paying customers, $18K MRR, 14% month-over-month growth.")),
      h(2, "left", "Contact"),
      p("left", text("founders@loopinventory.com · loopinventory.com"))
    ),
  },
  {
    key: "press-release",
    name: "Press Release",
    description: "Announce news in a clear, media-ready format.",
    icon: Megaphone,
    content: doc(
      p("left", text("FOR IMMEDIATE RELEASE", true)),
      h(1, "left", "Aria Health Raises $12M to Expand Telehealth Access in Rural Communities"),
      p("left", text("Denver, CO — June 27, 2026 — Aria Health, a telehealth platform serving rural clinics, today announced a $12M Series A funding round.")),
      p(
        "left",
        text(
          "The funding will support Aria's expansion into 200 additional rural clinics across the Midwest over the next 18 months, and the launch of its new remote-monitoring toolkit."
        )
      ),
      hr(),
      p("left", text("About Aria Health", true)),
      p("left", text("Aria Health partners with rural clinics to provide telehealth infrastructure, serving over 80,000 patients since its founding in 2022.")),
      p("left", text("Media Contact: ", true), text("press@ariahealth.com"))
    ),
  },
  {
    key: "job-offer",
    name: "Job Offer Letter",
    description: "Formal offer of employment with role, salary, and start date.",
    icon: FileSignature,
    content: doc(
      p("left", text("June 27, 2026")),
      p("left", text("Dear Jordan,")),
      p("left", text("We are pleased to offer you the position of ", false), text("Marketing Manager", true), text(" at ", false), text("Brightline Co.", true), text(".")),
      hr(),
      table(
        row(cell(p("left", text("Start date:", true))), cell(p("right", text("July 14, 2026")))),
        row(cell(p("left", text("Salary:", true))), cell(p("right", text("$78,000 / year")))),
        row(cell(p("left", text("Reports to:", true))), cell(p("right", text("VP of Marketing"))))
      ),
      hr(),
      p("left", text("This offer is contingent on a standard background check. Please confirm your acceptance by July 1, 2026.")),
      p("left", text("Sincerely,")),
      p("left", text("Dana Whitfield, Head of People"))
    ),
  },
  {
    key: "rental-agreement",
    name: "Rental Agreement",
    description: "Key terms for renting a property between landlord and tenant.",
    icon: Home,
    content: doc(
      h(1, "left", "Rental Agreement"),
      table(
        row(cell(p("left", text("Landlord:", true))), cell(p("right", text("Renee Park")))),
        row(cell(p("left", text("Tenant:", true))), cell(p("right", text("Oliver Bennett")))),
        row(cell(p("left", text("Property:", true))), cell(p("right", text("482 Birchwood Ave, Unit 3"))))
      ),
      hr(),
      h(2, "left", "Term"),
      p("left", text("12 months, beginning August 1, 2026 and ending July 31, 2027.")),
      h(2, "left", "Rent & Deposit"),
      p("left", text("$1,650/month, due on the 1st. Security deposit of $1,650, refundable per local law.")),
      h(2, "left", "Terms & Conditions"),
      bullets("No subletting without written consent", "Tenant responsible for utilities", "30 days' notice required to terminate"),
      hr(),
      table(row(cell(p("left", text("Landlord signature"))), cell(p("right", text("Tenant signature")))))
    ),
  },
  {
    key: "nda",
    name: "Non-Disclosure Agreement",
    description: "A short mutual NDA template to protect shared information.",
    icon: Lock,
    content: doc(
      h(1, "left", "Non-Disclosure Agreement"),
      p("left", text("Between ", false), text("Lumen Studio", true), text(" and ", false), text("Northwind Co.", true), text(", dated ", false), text("June 27, 2026", true)),
      hr(),
      h(2, "left", "1. Confidential Information"),
      p("left", text("Both parties may share business, technical, or financial information that is identified as confidential.")),
      h(2, "left", "2. Obligations"),
      p("left", text("Each party agrees to use the other's confidential information solely to evaluate a potential business relationship, and not to disclose it to third parties.")),
      h(2, "left", "3. Term"),
      p("left", text("This agreement remains in effect for 2 years from the date above.")),
      hr(),
      table(row(cell(p("left", text("Lumen Studio signature"))), cell(p("right", text("Northwind Co. signature")))))
    ),
  },
  {
    key: "wedding-invitation",
    name: "Wedding Invitation",
    description: "An elegant invite with date, venue, and RSVP details.",
    icon: Heart,
    content: doc(
      p("center", text("Together with their families")),
      h(1, "center", "Elena & Marcus"),
      p("center", text("request the honor of your presence as they exchange vows")),
      hr(),
      table(row(cell(p("center", text("September 12, 2026", true))), cell(p("center", text("4:00 PM", true))), cell(p("center", text("The Garden Pavilion", true))))),
      hr(),
      p("center", text("Reception to follow. RSVP by August 15 to elenaandmarcus@email.com"))
    ),
  },
  {
    key: "birthday-invitation",
    name: "Birthday Invitation",
    description: "A fun, colorful invite for a birthday celebration.",
    icon: PartyPopper,
    content: doc(
      h(1, "center", "You're Invited!"),
      p("center", text("Join us in celebrating Maya's 7th birthday")),
      hr(),
      table(row(cell(p("center", text("July 19, 2026", true))), cell(p("center", text("2:00 PM", true))), cell(p("center", text("Sunnyvale Park, Pavilion 2", true))))),
      hr(),
      p("center", text("Cake, games, and lots of fun! RSVP to (555) 234-5678"))
    ),
  },
  {
    key: "event-flyer",
    name: "Event Flyer",
    description: "A bold, eye-catching flyer for an upcoming event.",
    icon: CalendarDays,
    content: doc(
      h(1, "center", "Summer Night Market"),
      p("center", text("Local vendors, live music, and street food under the stars")),
      hr(),
      table(row(cell(p("center", text("August 8, 2026", true))), cell(p("center", text("6 — 10 PM", true))), cell(p("center", text("Riverside Plaza", true))))),
      hr(),
      p("center", text("Free entry · More info: summernightmarket.com"))
    ),
  },
  {
    key: "weekly-planner",
    name: "Weekly Planner",
    description: "Plan tasks and priorities across the week.",
    icon: CalendarRange,
    content: doc(
      h(1, "left", "Weekly Planner"),
      p("left", text("Week of June 22, 2026")),
      hr(),
      table(
        row(cell(p("left", text("Day")), true), cell(p("left", text("Top priority")), true), cell(p("left", text("Notes")), true)),
        row(cell(p("left", text("Mon"))), cell(p("left", text("Finish client proposal"))), cell(p("left", text("Send by 5pm")))),
        row(cell(p("left", text("Tue"))), cell(p("left", text("Team standup + design review"))), cell(p())),
        row(cell(p("left", text("Wed"))), cell(p("left", text("Doctor's appointment"))), cell(p("left", text("10am")))),
        row(cell(p("left", text("Thu"))), cell(p("left", text("Prep for Friday demo"))), cell(p())),
        row(cell(p("left", text("Fri"))), cell(p("left", text("Demo + weekly wrap-up"))), cell(p())),
        row(cell(p("left", text("Sat"))), cell(p()), cell(p())),
        row(cell(p("left", text("Sun"))), cell(p("left", text("Rest & plan next week"))), cell(p()))
      )
    ),
  },
  {
    key: "daily-journal",
    name: "Daily Journal",
    description: "Mood, highlights, and a free space to reflect on the day.",
    icon: BookOpen,
    content: doc(
      h(1, "left", "Today"),
      p("left", text("Mood: Calm and a little tired")),
      h(2, "left", "Highlight of the day"),
      p("left", text("Had a really good conversation with an old friend I hadn't talked to in months.")),
      h(2, "left", "What I'm thinking about"),
      p("left", text("Whether to take on the new project at work — excited but a bit overwhelmed.")),
      h(2, "left", "Tomorrow"),
      p("left", text("Go for a walk in the morning before things get busy."))
    ),
  },
  {
    key: "recipe-card",
    name: "Recipe Card",
    description: "Ingredients and steps for a favorite recipe.",
    icon: ChefHat,
    content: doc(
      h(1, "left", "Lemon Garlic Roasted Chicken"),
      p("left", text("Serves 4 · Prep 15 min · Cook 1 hr 10 min")),
      hr(),
      h(2, "left", "Ingredients"),
      bullets("1 whole chicken (about 4 lbs)", "2 lemons, halved", "6 garlic cloves, smashed", "3 tbsp olive oil", "Salt, pepper, fresh thyme"),
      h(2, "left", "Steps"),
      p("left", text("1. Preheat oven to 425°F. Pat the chicken dry and season generously inside and out.")),
      p("left", text("2. Stuff the cavity with lemon halves, garlic, and thyme. Rub the skin with olive oil.")),
      p("left", text("3. Roast for 60–70 minutes until internal temp reaches 165°F. Rest 10 minutes before carving."))
    ),
  },
  {
    key: "travel-itinerary",
    name: "Travel Itinerary",
    description: "Day-by-day plan for flights, stays, and activities.",
    icon: Plane,
    content: doc(
      h(1, "left", "Trip to Lisbon"),
      p("left", text("Sep 3 — 9, 2026 · Travelers: Sam & Dana")),
      hr(),
      h(2, "left", "Day 1 — Arrival"),
      p("left", text("Land at LIS 2:30 PM. Check in at Hotel Alfama. Evening walk through Alfama district, dinner at Taberna da Rua das Flores.")),
      h(2, "left", "Day 2 — Belém"),
      p("left", text("Morning at Jerónimos Monastery, pastéis de nata at Pastéis de Belém, afternoon at MAAT museum.")),
      hr(),
      h(2, "left", "Flights & Stays"),
      table(
        row(cell(p("left", text("Item")), true), cell(p("right", text("Details")), true)),
        row(cell(p("left", text("Outbound flight"))), cell(p("right", text("TAP 234, Sep 3, 8:10 AM")))),
        row(cell(p("left", text("Hotel"))), cell(p("right", text("Hotel Alfama, 5 nights"))))
      )
    ),
  },
  {
    key: "workout-plan",
    name: "Workout Plan",
    description: "A weekly training split with sets, reps, and notes.",
    icon: Dumbbell,
    content: doc(
      h(1, "left", "Workout Plan"),
      p("left", text("Goal: Build strength · Duration: 8 weeks")),
      hr(),
      table(
        row(cell(p("left", text("Exercise")), true), cell(p("right", text("Sets")), true), cell(p("right", text("Reps")), true)),
        row(cell(p("left", text("Back squat"))), cell(p("right", text("4"))), cell(p("right", text("6")))),
        row(cell(p("left", text("Bench press"))), cell(p("right", text("4"))), cell(p("right", text("8")))),
        row(cell(p("left", text("Deadlift"))), cell(p("right", text("3"))), cell(p("right", text("5")))),
        row(cell(p("left", text("Pull-ups"))), cell(p("right", text("3"))), cell(p("right", text("As many as possible"))))
      )
    ),
  },
  {
    key: "study-planner",
    name: "Study Planner",
    description: "Break a subject into goals, sessions, and what to review.",
    icon: GraduationCap,
    content: doc(
      h(1, "left", "Study Planner"),
      p("left", text("Subject: Organic Chemistry — Midterm 2")),
      h(2, "left", "Goals"),
      bullets("Understand reaction mechanisms", "Memorize functional group reactivity", "Practice 20 past-exam problems"),
      h(2, "left", "This week's sessions"),
      p("left", text("Mon/Wed/Fri, 7–9 PM — chapters 8–10 and practice problems.")),
      h(2, "left", "To review"),
      bullets("SN1 vs SN2 mechanisms", "Stereochemistry rules")
    ),
  },
]
