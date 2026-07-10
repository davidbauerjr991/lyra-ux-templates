import React, { useState, useEffect, useMemo, useRef } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  AppHeader,
  AppName,
  AppMenu,
  CXoneLogo,
  AiPanel,
  AiSparkleIcon,
  NotificationsBell,
  AgentNotifications,
  AgentProfile,
  Container,
  Panel,
  CustomerInformationPanel,
  PanelPinButton,
  PageHeader,
  Button,
  Input,
  LeftNav,
  CreateNew,
  useOutboundAddButton,
  InteractionNavItem,
  AgentDashboard,
  AgentDashboardQueueDrilldown,
  AGENT_DASHBOARD_QUEUE_ITEMS,
  Tooltip,
  TabList,
  ChannelTab,
  type NavItem,
  type CreateNewOutboundConfig,
  type CreateNewOutboundContact,
  type InteractionChannel,
  type ChannelType,
  type AgentStatus,
  type AppMenuGroup,
  type AgentNotification,
  type DraggableVariant,
  type AgentDashboardContactHistoryEntry,
} from "@nicecxone/lyra-ui";
import { CREATE_NEW_AGENTS } from "@nicecxone/lyra-ui/agents-data";
import { CREATE_NEW_CUSTOMERS } from "@nicecxone/lyra-ui/customers-data";
import appIcon from "@/assets/app-icon.svg";
import {
  Home,
  Search,
  NotebookPen,
  Settings,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  User,
} from "lucide-react";

/* ── App menu builder (needs onNavigate so built inside the component) ── */

function buildAppMenuGroups(onNavigate?: (page: Page) => void): AppMenuGroup[] {
  return [
    {
      items: [
        { label: "Agent Next Gen", active: true },
        { label: "Agent Workspace Premium", onClick: () => onNavigate?.("agent-workspace") },
        { label: "Outbound Engagement", onClick: () => onNavigate?.("outbound") },
      ],
    },
  ];
}

/* ── Create New → Outbound config ──
   Mirrors lyra-ui's CreateNew "Create New → Outbound" story (see
   lyra-ui/src/components/__stories__/create-new-outbound-mock.tsx) — only
   "Outbound" is wired up, the rest render as coming-soon placeholders. Teams,
   skills, and assignments below are small, app-specific lists kept local —
   lyra-ui's reference mock doesn't have an "Assignments" group, so it's
   added here the same way Teams/Skills already were — but the agent and
   customer "database" records themselves come from lyra-ui's shared
   fixture files (via the /agents-data and /customers-data aliases in
   vite.config.ts) so this app's Outbound picker can't quietly drift out of
   sync with lyra-ui's own story — same records, mapped into the shape
   `CreateNew` expects exactly like lyra-ui's own mock file does. */

function initialsFor(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const OUTBOUND_AGENTS: NonNullable<CreateNewOutboundConfig["groups"][number]["contacts"]> = CREATE_NEW_AGENTS.map((a) => ({
  id: a.id,
  name: a.name,
  initials: initialsFor(a.name),
  subtitle: a.agentId,
  avatarClassName: a.avatarClassName,
  channels: a.channels,
  status: a.status,
}));

const OUTBOUND_CUSTOMERS: NonNullable<CreateNewOutboundConfig["groups"][number]["contacts"]> = CREATE_NEW_CUSTOMERS.map((c) => ({
  id: c.id,
  name: c.name,
  initials: initialsFor(c.name),
  subtitle: c.customerId,
  avatarClassName: c.avatarClassName,
  channels: c.channels,
}));

const OUTBOUND_TEAMS: NonNullable<CreateNewOutboundConfig["groups"][number]["contacts"]> = [
  { id: "t1", name: "Billing Support",    initials: "BS", subtitle: "TEAM-04", avatarClassName: "bg-lyra-accent-purple-soft text-lyra-accent-purple-strong", channels: ["voice", "email"] },
  { id: "t2", name: "Tier 2 Escalations", initials: "T2", subtitle: "TEAM-07", avatarClassName: "bg-lyra-accent-red-soft text-lyra-accent-red-strong",       channels: ["voice", "email"] },
];

const OUTBOUND_SKILLS: NonNullable<CreateNewOutboundConfig["groups"][number]["contacts"]> = [
  { id: "s1", name: "Spanish Language",  initials: "ES", subtitle: "SKL-12", avatarClassName: "bg-lyra-accent-green-soft text-lyra-accent-green-strong", channels: ["voice", "email"] },
  { id: "s2", name: "Technical Support", initials: "TS", subtitle: "SKL-03", avatarClassName: "bg-lyra-accent-blue-soft text-lyra-accent-blue-strong",   channels: ["voice", "email"] },
];

const OUTBOUND_ASSIGNMENTS: NonNullable<CreateNewOutboundConfig["groups"][number]["contacts"]> = [
  { id: "a1", name: "VIP Escalation Review",  initials: "VE", subtitle: "ASN-021", avatarClassName: "bg-lyra-accent-orange-soft text-lyra-accent-orange-strong", channels: ["voice", "email"] },
  { id: "a2", name: "Onboarding Follow-up",   initials: "OF", subtitle: "ASN-014", avatarClassName: "bg-lyra-accent-teal-soft text-lyra-accent-teal-strong",     channels: ["voice", "email"] },
];

const OUTBOUND_CONFIG: CreateNewOutboundConfig = {
  outboundTitle: "New Outbound",
  groups: [
    { id: "favorites", label: "Favorites", kind: "favorites", emptyMessage: "No favorites yet" },
    { id: "agents", label: "Agents", searchPlaceholder: "Search Agents", contacts: OUTBOUND_AGENTS },
    { id: "teams", label: "Teams", searchPlaceholder: "Search teams", contacts: OUTBOUND_TEAMS },
    { id: "skills", label: "Skills", searchPlaceholder: "Search skills", contacts: OUTBOUND_SKILLS },
    { id: "assignments", label: "Assignments", searchPlaceholder: "Search assignments", contacts: OUTBOUND_ASSIGNMENTS },
    { id: "customers", label: "Customers", searchPlaceholder: "Search customers", contacts: OUTBOUND_CUSTOMERS },
    { id: "dialpad", label: "Dial Pad", kind: "dialpad" },
  ],
  defaultGroupId: "agents",
  channelOptions: [
    { id: "voice",    label: "Call",     selectLabel: "Voice", icon: <Phone         className="h-5 w-5" strokeWidth={1.5} /> },
    { id: "email",    label: "Email",                          icon: <Mail          className="h-5 w-5" strokeWidth={1.5} /> },
    { id: "sms",      label: "SMS",                            icon: <MessageSquare className="h-5 w-5" strokeWidth={1.5} /> },
    { id: "whatsapp", label: "WhatsApp",                       icon: <MessageCircle className="h-5 w-5" strokeWidth={1.5} /> },
  ],
  phoneOptions: [
    { value: "+14563833329", label: "(456) 383-3329" },
    { value: "+14565559981", label: "(456) 555-9981" },
    { value: "+14565550147", label: "(456) 555-0147" },
  ],
  skillOptions: [
    { value: "general", label: "General Support" },
    { value: "technical", label: "Technical Support" },
    { value: "billing", label: "Billing" },
    { value: "sales", label: "Sales" },
    { value: "escalations", label: "Escalations" },
    { value: "vip", label: "VIP Support" },
  ],
  onQuickDial: (phoneNumber) => {
    // eslint-disable-next-line no-console
    console.log("Quick dial:", phoneNumber);
  },
  onStartCall: (selection) => {
    // eslint-disable-next-line no-console
    console.log(
      "Start call:",
      selection.channel,
      "→",
      selection.contact.name,
      `(phone: ${selection.phone}, skill: ${selection.skillId})`
    );
  },
  pageSize: 10,
};

/* ── Left nav interaction tracking ──
   Mirrors lyra-ui's `Templates/Agent Next Gen` story ("Agent Next Gen
   Template") — starting/quick-dialing from `CreateNew` above surfaces a
   real `InteractionNavItem` card here instead of leaving the rail static,
   same interaction model as that template and agent-next-gen-v1. See that
   story's own doc comments for the full rationale behind each piece below;
   kept in lockstep with it on purpose rather than inventing a different
   shape, so this app doesn't quietly drift from the template it's based
   on. */

interface TrackedChannel {
  id: string;
  type: ChannelType;
  startTick: number;
  preview?: string;
  value?: string;
  /** Human-readable version of `value` for display on this channel's
   *  `ChannelTab` (e.g. "(456) 383-3329" vs. `value`'s raw "+14563833329").
   *  See agent-next-gen-v1's own copy of this field for the full rationale. */
  addressLabel?: string;
  awaitingResponse?: boolean;
  /** Synthesized message count/conversation id shown on this channel's
   *  `ChannelTab` tooltip — see agent-next-gen-v1's own copy of these two
   *  fields for the full rationale. */
  messageCount?: number;
  interactionId?: string;
}

interface ActiveInteraction {
  id: string;
  customerName?: string;
  /** Customer/agent/team/skill record id shown under the name on this
   *  interaction's detail page header — the contact's real id
   *  (`CreateNewOutboundContact.subtitle`) when known, or a freshly
   *  generated case number (`generateCaseId`) for quick-dialed numbers with
   *  no matching record. See agent-next-gen-v1's own copy of this field. */
  recordId: string;
  channels: TrackedChannel[];
  /** Which open channel is "current" — shared between this interaction's
   *  InteractionNavItem card and its ChannelTab bar. See agent-next-gen-v1's
   *  own copy of this field for the full rationale. */
  currentChannelId?: string;
}

/** Fallback case id for interactions with no real record behind them
 *  (quick-dialed numbers) — see agent-next-gen-v1's own copy. */
function generateCaseId(): string {
  return `CS-${Math.floor(1000000 + Math.random() * 9000000)}`;
}

/** Synthesized per-channel conversation/session id — see agent-next-gen-v1's
 *  own copy of this helper for the full rationale. */
function generateInteractionId(): string {
  return String(Math.floor(100000000000 + Math.random() * 900000000000));
}

function formatElapsedTime(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const mm = Math.floor(clamped / 60);
  const ss = clamped % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

/* ── Left nav items ──
   "Home" is built from whether an interaction is currently active (see
   `activeInteraction` below) rather than a static `active: true`, so it
   stops showing as active — and becomes clickable to navigate back — the
   moment an assignment takes over the main content area. See
   agent-next-gen-v1's own copy of this pattern. */

function buildNavItems(hasActiveInteraction: boolean, onHomeClick: () => void): NavItem[] {
  return [
    {
      icon: <Home className="h-4 w-4" strokeWidth={1.5} />,
      label: "Home",
      active: !hasActiveInteraction,
      onClick: onHomeClick,
    },
    {
      icon: <Search className="h-4 w-4" strokeWidth={1.5} />,
      label: "Search",
    },
    {
      icon: <NotebookPen className="h-4 w-4" strokeWidth={1.5} />,
      label: "WEM",
    },
    {
      icon: <Settings className="h-4 w-4" strokeWidth={1.5} />,
      label: "Settings",
    },
  ];
}

/* ── Sample notifications ── */

const INITIAL_NOTIFICATIONS: AgentNotification[] = [
  { id: "1", type: "new-case",    title: "New Case",    subtitle: "Noah Patel",    timestamp: "13m ago", read: false },
  { id: "2", type: "new-chat",    title: "New Chat",    subtitle: "Sarah Miller",  timestamp: "18m ago", read: false },
  { id: "3", type: "escalation",  title: "Escalation",  subtitle: "Lauren Kim",    timestamp: "24m ago", read: false },
  { id: "4", type: "new-case",    title: "New Case",    subtitle: "Ethan Zhang",   timestamp: "37m ago", read: true  },
  { id: "5", type: "new-chat",    title: "New Chat",    subtitle: "Olivia Reed",   timestamp: "51m ago", read: true  },
  { id: "6", type: "missed-call", title: "Missed Call", subtitle: "David Brown",   timestamp: "1h ago",  read: true  },
];

/* ── AgentNextGenPage ── */

type Page = "agent-workspace" | "agent" | "outbound";

const AI_PANEL_DEFAULT_WIDTH = 360;

export function AgentNextGenPage({
  showPageHeader = false,
  showPanelToggle = false,
  showInteriorPanel = true,
  onNavigate,
  initialInteraction,
  sidePanelToggleLabel,
}: {
  showPageHeader?: boolean;
  showPanelToggle?: boolean;
  showInteriorPanel?: boolean;
  onNavigate?: (page: Page) => void;
  /**
   * Seeds `interactions`/`activeInteractionId` with an already-active call
   * instead of starting empty — mirrors lyra-ui's `AgentNextGenTemplate`
   * "Active Interaction" story prop of the same name (see that story's own
   * doc comment for the full rationale). Not passed anywhere in this app
   * today — kept as an opt-in capability so this component stays in sync
   * with the canonical template's shape, not to change default behavior.
   */
  initialInteraction?: ActiveInteraction;
  /**
   * Overrides the record-header `PanelPinButton`'s tooltip (both pinned and
   * unpinned label, since "Toggle Overview" describes the action generically
   * rather than a pin/unpin pair) — mirrors lyra-ui's `AgentNextGenTemplate`
   * prop of the same name. Defaults to "Toggle Overview" here too, matching
   * that template's current copy; pass a different string to override it.
   */
  sidePanelToggleLabel?: string;
}) {
  const [navOpen, setNavOpen] = useState(!!initialInteraction);
  // No interactions exist until the agent launches one from the CreateNew
  // menu (Start Interaction / quick dial) — same pattern as lyra-ui's
  // `Templates/Agent Next Gen` story. Click any resulting InteractionNavItem
  // card to make it the active one. `initialInteraction` (see above) seeds
  // this instead, for callers that want to start already mid-call.
  const [interactions, setInteractions] = useState<ActiveInteraction[]>(
    () => (initialInteraction ? [initialInteraction] : [])
  );
  const [activeInteractionId, setActiveInteractionId] = useState<string | null>(
    () => initialInteraction?.id ?? null
  );
  // Drives the main content area — see agent-next-gen-v1's own copy of this
  // derived value and the PageHeader switch below.
  const activeInteraction = interactions.find((i) => i.id === activeInteractionId) ?? null;
  // Shared clock powering every open channel's live "MM:SS since it
  // started" elapsed display — independent of `elapsedSeconds` below, which
  // is the agent's own status timer and resets on status change.
  const [clockTick, setClockTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setClockTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  // Which AgentDashboard queue widget is selected — drives the interior
  // panel's queue drill-down (see the "Home" body below).
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("available");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [appMenuOpen, setAppMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => document.documentElement.getAttribute("data-theme") === "dark"
  );

  const handleDarkModeToggle = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
      return next;
    });
  };

  const appMenuGroups = buildAppMenuGroups((page) => {
    setAppMenuOpen(false);
    onNavigate?.(page);
  });

  /* ── Launching interactions from CreateNew ──
     Overrides OUTBOUND_CONFIG's default onStartCall/onQuickDial (which just
     console.log) so this page actually surfaces what gets launched as
     InteractionNavItem cards in the left nav. Mirrors lyra-ui's
     `Templates/Agent Next Gen` story's own handlers exactly — see that
     story for the full rationale on each piece. */
  const handleStartCall = (selection: {
    contact: CreateNewOutboundContact;
    channel: ChannelType;
    phone: string;
    skillId: string;
  }) => {
    const skillLabel = OUTBOUND_CONFIG.skillOptions.find((o) => o.value === selection.skillId)?.label;
    // `phoneOptions` only has a value→label mapping for phone numbers (raw
    // digits → formatted display string) — email/WhatsApp addresses are
    // already human-readable as-is (see `create-new.tsx`'s
    // `defaultDetailValueFor`, where their `value` and `label` are the same
    // string), so falling back to `selection.phone` itself is correct there,
    // not a placeholder.
    const addressLabel = OUTBOUND_CONFIG.phoneOptions.find((o) => o.value === selection.phone)?.label ?? selection.phone;
    // A freshly started outbound conversation hasn't exchanged any messages
    // yet — `0` (not omitted) so the tooltip actually reads "0 Messages"
    // instead of showing nothing. Voice has no message concept at all, so
    // it's left `undefined` there — see agent-next-gen-v1's own copy of
    // this logic for the full rationale.
    const newChannel: TrackedChannel = {
      id: `${selection.channel}:${selection.phone}`,
      type: selection.channel,
      startTick: clockTick,
      preview: skillLabel,
      value: selection.phone,
      addressLabel,
      messageCount: selection.channel === "voice" ? undefined : 0,
      interactionId: generateInteractionId(),
    };

    setInteractions((prev) => {
      const idx = prev.findIndex((i) => i.id === selection.contact.id);
      if (idx === -1) {
        return [...prev, {
          id: selection.contact.id,
          customerName: selection.contact.name,
          recordId: selection.contact.subtitle ?? generateCaseId(),
          channels: [newChannel],
          currentChannelId: newChannel.id,
        }];
      }
      return prev.map((interaction, i) => {
        if (i !== idx) return interaction;
        const chIdx = interaction.channels.findIndex((c) => c.id === newChannel.id);
        const channels = chIdx === -1
          ? [...interaction.channels, newChannel]
          : interaction.channels.map((c, j) => (j === chIdx ? newChannel : c));
        return { ...interaction, channels, currentChannelId: newChannel.id };
      });
    });
    setActiveInteractionId(selection.contact.id);
    setNavOpen(true);
  };

  const handleQuickDial = (phoneNumber: string) => {
    const id = `quickdial:${phoneNumber}`;
    // Voice has no message concept at all, so `messageCount` is left
    // undefined here (not `0`) — see the `handleStartCall` comment above.
    const newChannel: TrackedChannel = {
      id: "voice",
      type: "voice",
      startTick: clockTick,
      value: phoneNumber,
      addressLabel: phoneNumber,
      interactionId: generateInteractionId(),
    };
    setInteractions((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return [...prev, { id, recordId: generateCaseId(), channels: [newChannel], currentChannelId: newChannel.id }];
      return prev.map((interaction, i) => (i === idx ? { ...interaction, channels: [newChannel], currentChannelId: newChannel.id } : interaction));
    });
    setActiveInteractionId(id);
    setNavOpen(true);
  };

  const handleDismissInteraction = (id: string) => {
    setInteractions((prev) => prev.filter((interaction) => interaction.id !== id));
    setActiveInteractionId((current) => (current === id ? null : current));
  };

  const handleDismissChannel = (id: string, channel: Pick<InteractionChannel, "id" | "type">) => {
    const dismissedKey = channel.id ?? channel.type;
    setInteractions((prev) =>
      prev.map((interaction) => {
        if (interaction.id !== id) return interaction;
        const channels = interaction.channels.filter((c) => (c.id ?? c.type) !== dismissedKey);
        const currentChannelId = interaction.currentChannelId === dismissedKey
          ? channels[channels.length - 1]?.id
          : interaction.currentChannelId;
        return { ...interaction, channels, currentChannelId };
      })
    );
  };

  /** Fired by a card row's `onCurrentChannelChange` or a `ChannelTab`'s
   *  `onClick` — see `ActiveInteraction.currentChannelId`'s own doc comment. */
  const handleChannelSelect = (interactionId: string, channelKey: string) => {
    setInteractions((prev) =>
      prev.map((interaction) =>
        interaction.id === interactionId ? { ...interaction, currentChannelId: channelKey } : interaction
      )
    );
  };

  /* ── Preventing duplicate channels from the CreateNew picker ──
     See lyra-ui's `Templates/Agent Next Gen` story's own `outboundConfig`
     useMemo for the full rationale — kept identical here. */
  const outboundConfig = useMemo<CreateNewOutboundConfig>(() => {
    const openAddressesByContactId = new Map<string, Partial<Record<ChannelType, string[]>>>(
      interactions.map((interaction) => {
        const byType: Partial<Record<ChannelType, string[]>> = {};
        for (const c of interaction.channels) {
          if (!c.value) continue;
          (byType[c.type] ??= []).push(c.value);
        }
        return [interaction.id, byType];
      })
    );
    return {
      ...OUTBOUND_CONFIG,
      groups: OUTBOUND_CONFIG.groups.map((group) => {
        if (!group.contacts) return group;
        return {
          ...group,
          contacts: group.contacts.map((contact) => {
            const openChannelAddresses = openAddressesByContactId.get(contact.id);
            if (!openChannelAddresses || Object.keys(openChannelAddresses).length === 0) return contact;
            return { ...contact, openChannelAddresses };
          }),
        };
      }),
    };
  }, [interactions]);

  // Same shared hook every "Agent Next Gen" consumer uses for the "+" button
  // on each InteractionNavItem card — see create-new.tsx's own doc comment.
  const { launchRequest: outboundLaunchRequest, onLaunchRequestHandled, getHeaderAction } = useOutboundAddButton(outboundConfig);

  /* Panel animation state machine — see AgentNextGenTemplate.stories.tsx for full comment */
  type PanelState = "closed" | "open" | "closing";

  /* AI panel state */
  const [aiPanelOpen,  setAiPanelOpen]  = useState(false);
  const [aiMounted,    setAiMounted]    = useState(false);
  const [aiState,      setAiState]      = useState<PanelState>("closed");
  const [aiVariant,    setAiVariant]    = useState<DraggableVariant>("float");
  const [aiWidth,      setAiWidth]      = useState(AI_PANEL_DEFAULT_WIDTH);
  const [aiHeight,     setAiHeight]     = useState(860);
  const [aiIsResizing, setAiIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const aiFloatLeft  = useRef<number | null>(null);
  const aiFloatTop   = useRef<number | null>(null);
  const aiPanelRef   = useRef<HTMLDivElement>(null);
  const aiAnimTimer  = useRef<ReturnType<typeof setTimeout>>();

  /* Notifications panel state */
  const [notifOpen,       setNotifOpen]       = useState(false);
  const [notifMounted,    setNotifMounted]    = useState(false);
  const [notifState,      setNotifState]      = useState<PanelState>("closed");
  const [notifVariant,    setNotifVariant]    = useState<DraggableVariant>("float");
  const [notifWidth,      setNotifWidth]      = useState(360);
  const [notifHeight,     setNotifHeight]     = useState(860);
  const [notifIsResizing, setNotifIsResizing] = useState(false);
  const [topPanel,        setTopPanel]        = useState<"ai" | "notif" | null>(null);
  const notifFloatLeft = useRef<number | null>(null);
  const notifFloatTop  = useRef<number | null>(null);
  const notifPanelRef  = useRef<HTMLDivElement>(null);
  const notifAnimTimer = useRef<ReturnType<typeof setTimeout>>();

  /* Interior panel (right) */
  const [interiorPanelOpen, setInteriorPanelOpen] = useState(false);

  /* Side panel */
  const [sidePanelOpen,      setSidePanelOpen]      = useState(false);
  const [sidePanelPinned,    setSidePanelPinned]    = useState(false);
  const [sidePanelResizing,  setSidePanelResizing]  = useState(false);
  const [sidePanelWidth,     setSidePanelWidth]     = useState(256);
  const [containerWidth,     setContainerWidth]     = useState(9999);
  const sidePanelTimer = useRef<ReturnType<typeof setTimeout>>();

  // Track container width to force unpinned below 768px
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isNarrowContainer = containerWidth < 768;
  // When narrow: force overlay mode and hide pin button
  const effectivePinned = isNarrowContainer ? false : sidePanelPinned;

  // Close (and fully unpin) the Designer panel the moment the container
  // drops below 768px. See agent-next-gen-v1's own copy of this effect for
  // the full rationale.
  useEffect(() => {
    if (isNarrowContainer) {
      setSidePanelOpen(false);
      setSidePanelPinned(false);
    }
  }, [isNarrowContainer]);

  // The Designer panel belongs to the interaction it was opened from — its
  // only trigger is the record icon on the interaction `PageHeader`, which
  // doesn't exist on the Home dashboard. Leaving the interaction must close
  // it the same way narrowing the container does above. See
  // agent-next-gen-v1's own copy of this effect for the full rationale.
  useEffect(() => {
    if (!activeInteractionId) {
      setSidePanelOpen(false);
      setSidePanelPinned(false);
    }
  }, [activeInteractionId]);

  // Track window width for nav overlay breakpoint
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isNavNarrow = windowWidth < 1280;
  const isCompactHeader = windowWidth < 760;

  // Auto-collapse the expanded nav when viewport drops below 1280px
  useEffect(() => {
    if (isNavNarrow && navOpen) setNavOpen(false);
  }, [isNavNarrow]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close and undock any docked panels when viewport drops below 1280px
  useEffect(() => {
    if (isNavNarrow) {
      if (aiVariant === "docked") {
        setAiVariant("float");
        setAiPanelOpen(false);
      }
      if (notifVariant === "docked") {
        setNotifVariant("float");
        setNotifOpen(false);
      }
    }
  }, [isNavNarrow]); // eslint-disable-line react-hooks/exhaustive-deps

  // No hidden gating here — matches lyra-ui's `Panel.stories.tsx` "Side
  // Panel" story, where `pinned` and `open` are two plain, independent
  // booleans and nothing about toggling one disables the other's normal
  // control going forward. Hovering the icon always previews the panel
  // while unpinned. See agent-next-gen-v1's own copy of this handler for
  // the full rationale.
  const onSidePanelHoverStart = () => {
    clearTimeout(sidePanelTimer.current);
    setSidePanelOpen(true);
  };
  // Guarded on `sidePanelPinned`: once the icon has pinned the panel open,
  // moving the mouse away must NOT auto-close it after the delay below.
  // See agent-next-gen-v1's own copy of this handler for the full rationale.
  const onSidePanelHoverEnd = () => {
    if (sidePanelPinned) return;
    sidePanelTimer.current = setTimeout(() => setSidePanelOpen(false), 300);
  };
  const handleSidePanelPinToggle = () => {
    setSidePanelPinned((v) => !v);
    setSidePanelOpen(true);
  };
  /* Click on the interaction record icon (see the `icon` prop on that
     PageHeader below) — distinct from `handleSidePanelPinToggle` above
     (the panel's own internal pin button), which always leaves the panel
     open. This one is a real on/off toggle: click once to pin the Designer
     panel open, click again to unpin *and* close it. See agent-next-gen-v1's
     own copy of this handler for the full rationale. */
  const handleSidePanelIconToggle = () => {
    clearTimeout(sidePanelTimer.current);
    const nextPinned = !sidePanelPinned;
    setSidePanelPinned(nextPinned);
    setSidePanelOpen(nextPinned);
  };

  const MAX_PANEL_HEIGHT = 860;
  const BOTTOM_PADDING   = 8;

  const computePanelHeight = () => {
    if (!containerRef.current) return MAX_PANEL_HEIGHT;
    const top = containerRef.current.getBoundingClientRect().top;
    return Math.min(window.innerHeight - top - BOTTOM_PADDING, MAX_PANEL_HEIGHT);
  };

  /* Timer */
  useEffect(() => {
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(elapsedSeconds / 3600);
  const m = Math.floor((elapsedSeconds % 3600) / 60);
  const s = elapsedSeconds % 60;
  const formattedTimer = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  const handleStatusChange = (status: AgentStatus) => {
    setAgentStatus(status);
    setElapsedSeconds(0);
  };

  /* AI panel show/hide */
  useEffect(() => {
    clearTimeout(aiAnimTimer.current);
    if (aiPanelOpen) {
      if (containerRef.current && aiFloatLeft.current === null) {
        const r = containerRef.current.getBoundingClientRect();
        aiFloatLeft.current = r.left + containerRef.current.offsetWidth - aiWidth - 16;
      }
      setAiHeight(computePanelHeight());
      setAiMounted(true);
      setAiState("open");
      setTopPanel("ai");
    } else {
      setAiState("closing");
      aiAnimTimer.current = setTimeout(() => setAiState("closed"), 150);
    }
    return () => clearTimeout(aiAnimTimer.current);
  }, [aiPanelOpen]);

  /* Shrink panel height with viewport when open */
  useEffect(() => {
    if (!aiPanelOpen) return;
    const onResize = () => setAiHeight(computePanelHeight());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [aiPanelOpen]);

  /* Notifications panel show/hide — same state machine as AI panel */
  useEffect(() => {
    clearTimeout(notifAnimTimer.current);
    if (notifOpen) {
      if (containerRef.current && notifFloatLeft.current === null) {
        const r = containerRef.current.getBoundingClientRect();
        notifFloatLeft.current = r.left + containerRef.current.offsetWidth - notifWidth - 16;
      }
      setNotifHeight(computePanelHeight());
      setNotifMounted(true);
      setNotifState("open");
      setTopPanel("notif");
    } else {
      setNotifState("closing");
      notifAnimTimer.current = setTimeout(() => setNotifState("closed"), 150);
    }
    return () => clearTimeout(notifAnimTimer.current);
  }, [notifOpen]);

  useEffect(() => {
    if (!notifOpen) return;
    const onResize = () => setNotifHeight(computePanelHeight());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [notifOpen]);

  const handleNotifVariantChange = (v: DraggableVariant) => {
    // When docking: capture actual rendered position (includes CSS transform drag offset)
    // before the float wrapper unmounts. This is restored when undocking.
    if (v === "docked" && notifPanelRef.current) {
      const r = notifPanelRef.current.getBoundingClientRect();
      notifFloatLeft.current = r.left;
      notifFloatTop.current  = r.top;
    }
    // Single-dock rule: if docking and AI panel is already docked, force AI to float.
    // AI has no float wrapper right now so fall back to a computed default position.
    if (v === "docked" && aiVariant === "docked" && containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      aiFloatLeft.current = r.left + containerRef.current.offsetWidth - aiWidth - 16;
      aiFloatTop.current  = null; // use computed default top
      setAiVariant("float");
    }
    setNotifVariant(v);
  };

  const getNotifFloatStyle = (): React.CSSProperties => {
    const rect = containerRef.current?.getBoundingClientRect();
    const left = notifFloatLeft.current !== null
      ? notifFloatLeft.current
      : containerRef.current
        ? (rect?.left ?? 0) + containerRef.current.offsetWidth - notifWidth - 16
        : 0;
    const top = notifFloatTop.current !== null
      ? notifFloatTop.current
      : (rect?.top ?? 0);
    return {
      position: "fixed",
      top,
      left,
      zIndex: topPanel === "notif" ? 10000 : 9999,
    };
  };

  const notifPanel = notifMounted ? (
    <AgentNotifications
      ref={notifPanelRef}
      notifications={notifications}
      draggableVariant={notifVariant}
      onVariantChange={handleNotifVariantChange}
      onWidthChange={setNotifWidth}
      onResizeStateChange={setNotifIsResizing}
      onInteract={() => setTopPanel("notif")}
      onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
      onClearAll={() => setNotifications([])}
      onDismiss={(id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
      onNotificationClick={(n: AgentNotification) =>
        setNotifications((prev) => prev.map((i) => i.id === n.id ? { ...i, read: true } : i))
      }
      onClose={() => setNotifOpen(false)}
      defaultWidth={notifWidth}
      height={notifHeight}
    />
  ) : null;

  const handleAiVariantChange = (v: DraggableVariant) => {
    // When docking: capture actual rendered position (includes CSS transform drag offset)
    // before the float wrapper unmounts. This is restored when undocking.
    if (v === "docked" && aiPanelRef.current) {
      const r = aiPanelRef.current.getBoundingClientRect();
      aiFloatLeft.current = r.left;
      aiFloatTop.current  = r.top;
    }
    // Single-dock rule: if docking and notif panel is already docked, force notif to float.
    // Notif has no float wrapper right now so fall back to a computed default position.
    if (v === "docked" && notifVariant === "docked" && containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      notifFloatLeft.current = r.left + containerRef.current.offsetWidth - notifWidth - 16;
      notifFloatTop.current  = null; // use computed default top
      setNotifVariant("float");
    }
    setAiVariant(v);
  };

  const getAiFloatStyle = (): React.CSSProperties => {
    const rect = containerRef.current?.getBoundingClientRect();
    const left = aiFloatLeft.current !== null
      ? aiFloatLeft.current
      : containerRef.current
        ? (rect?.left ?? 0) + containerRef.current.offsetWidth - aiWidth - 16
        : 0;
    const top = aiFloatTop.current !== null
      ? aiFloatTop.current
      : (rect?.top ?? 0);
    return {
      position: "fixed",
      top,
      left,
      zIndex: topPanel === "ai" ? 10000 : 9999,
    };
  };

  const aiPanel = aiMounted ? (
    <AiPanel
      ref={aiPanelRef}
      draggable
      draggableVariant={aiVariant}
      defaultDraggableWidth={aiWidth}
      defaultDraggableHeight={aiHeight}
      onVariantChange={handleAiVariantChange}
      onWidthChange={setAiWidth}
      onResizeStateChange={setAiIsResizing}
      onInteract={() => setTopPanel("ai")}
      userName="John"
      suggestions={[
        { id: "1", label: "Summarise this contact's history" },
        { id: "2", label: "Suggest a response to the customer" },
        { id: "3", label: "What changed since yesterday?" },
      ]}
      onClose={() => setAiPanelOpen(false)}
      className={aiVariant === "docked" ? "h-full" : undefined}
    />
  ) : null;

  return (
    <div className="flex flex-col h-screen bg-lyra-bg-surface-shell overflow-hidden animate-in fade-in-0 duration-500">

      {/* ── App Header ── */}
      <AppHeader
        appName={
          <PopoverPrimitive.Root open={appMenuOpen} onOpenChange={setAppMenuOpen}>
            <PopoverPrimitive.Trigger asChild>
              <AppName
                icon={<img src={appIcon} alt="Agent Next Gen" className="h-6 w-6" />}
                name="Agent Next Gen"
                compact={isCompactHeader}
                aria-expanded={appMenuOpen}
              />
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                side="bottom"
                align="start"
                sideOffset={6}
                onOpenAutoFocus={(e: Event) => e.preventDefault()}
                className="z-[9999] animate-in fade-in-0 slide-in-from-top-2 duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1 data-[state=closed]:duration-100"
              >
                <AppMenu
                  groups={appMenuGroups}
                  footer={<CXoneLogo />}
                  header={isCompactHeader ? "Agent Next Gen" : undefined}
                />
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        }
        actions={
          <>
            <NotificationsBell
              notifications={notifications}
              open={notifOpen}
              onOpenChange={setNotifOpen}
              renderPanel={false}
            />
            <Tooltip content="Ask AI" placement="bottom" asLabel>
              <button
                type="button"
                aria-label="Ask AI"
                aria-expanded={aiPanelOpen}
                onClick={() => setAiPanelOpen((v) => !v)}
                className={`relative flex h-10 w-10 items-center justify-center rounded-lyra-lg text-lyra-fg-default transition-colors hover:bg-lyra-state-hover active:bg-lyra-state-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lyra-border-focus ${aiPanelOpen ? "bg-lyra-state-hover" : ""}`}
              >
                <AiSparkleIcon />
              </button>
            </Tooltip>
            <AgentProfile
              name="John Smith"
              initials="JS"
              status={agentStatus}
              onStatusChange={handleStatusChange}
              onDarkModeToggle={handleDarkModeToggle}
              isDarkMode={darkMode}
              timer={formattedTimer}
              className="ml-1"
            />
          </>
        }
      />

      {/* ── Body: LeftNav + Content ── */}
      {/* overflow-hidden ensures docked panels never push layout past the viewport */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        <LeftNav
          items={buildNavItems(Boolean(activeInteraction), () => setActiveInteractionId(null))}
          open={navOpen}
          onToggle={() => setNavOpen((v) => !v)}
          overlay={isNavNarrow}
          pinnedHeader={
            <CreateNew
              title="New Outbound"
              outbound={{
                ...outboundConfig,
                onStartCall: handleStartCall,
                onQuickDial: handleQuickDial,
                launchRequest: outboundLaunchRequest,
                onLaunchRequestHandled,
              }}
              expanded={navOpen}
            />
          }
          header={
            <>
              {/* No cards until the agent actually starts one above — each
                  card is one contact (or quick-dialed number), with every
                  channel they're being reached on folded into that same
                  card. See lyra-ui's `Templates/Agent Next Gen` story for
                  the merge-by-type+address rationale. */}
              {interactions.map((interaction) => {
                const mostRecentId = interaction.channels[interaction.channels.length - 1]?.id;
                const currentId = interaction.currentChannelId ?? mostRecentId;
                const channels: InteractionChannel[] = interaction.channels.map((c) => ({
                  id: c.id,
                  type: c.type,
                  elapsed: formatElapsedTime(clockTick - c.startTick),
                  preview: c.preview,
                  current: c.id === currentId,
                  awaitingResponse: c.awaitingResponse ?? false,
                }));
                const earliestStart = Math.min(...interaction.channels.map((c) => c.startTick));
                return (
                  <InteractionNavItem
                    key={interaction.id}
                    customerName={interaction.customerName}
                    active={activeInteractionId === interaction.id}
                    onClick={() => setActiveInteractionId(interaction.id)}
                    awaitingResponse={channels.some((c) => c.awaitingResponse)}
                    elapsed={formatElapsedTime(clockTick - earliestStart)}
                    expanded={navOpen}
                    channels={channels}
                    onDismiss={() => handleDismissInteraction(interaction.id)}
                    onDismissChannel={(channel) => handleDismissChannel(interaction.id, channel)}
                    headerAction={getHeaderAction(interaction.id)}
                    currentChannelKey={currentId}
                    onCurrentChannelChange={(key) => handleChannelSelect(interaction.id, key)}
                  />
                );
              })}
            </>
          }
        />

        {/* Content area — flex-1 shrinks to give space to docked panels.
            ref used to position float panels. */}
        <div ref={containerRef} className="relative flex flex-1 min-w-0 overflow-hidden pr-3 pb-3">

          {/* Main Container — flex row so pinned Panel sits left of PageHeader + content.
              relative so unpinned Panel can overlay the full surface. */}
          <Container className="flex flex-1 overflow-hidden relative">

            {/* Customer Information Panel — one instance whose `pinned` prop
                just flips Panel's own internal inline-vs-overlay branch,
                matching Panel.stories.tsx's "Side Panel" story (a single
                element, props toggle) so the width transition animates
                correctly — two separately-gated `<Panel>` elements would
                unmount/remount on every toggle instead of animating. Gated
                on `activeInteraction`, not just `showPanelToggle` — its only
                trigger is the record icon on the interaction `PageHeader`
                below, which doesn't exist on the Home dashboard.
                Was a bare `<Panel headerTitle="Designer" .../>` with no body
                content — swapped for `CustomerInformationPanel` (lyra-ui),
                which fixes the header to "Customer Information" and adds a
                "{name} · {id}" subhead for whoever this interaction is
                with. See agent-next-gen-v1's own copy of this block for the
                full rationale. */}
            {showPanelToggle && activeInteraction && (
              <CustomerInformationPanel
                side="left"
                open={sidePanelOpen}
                pinned={effectivePinned}
                person={{ name: activeInteraction.customerName ?? "Customer", id: activeInteraction.recordId }}
                onPinToggle={isNarrowContainer ? undefined : handleSidePanelPinToggle}
                width={sidePanelWidth}
                onWidthChange={setSidePanelWidth}
                onResizeStateChange={setSidePanelResizing}
                onMouseEnter={onSidePanelHoverStart}
                onMouseLeave={sidePanelResizing ? undefined : onSidePanelHoverEnd}
              />
            )}

            {/* Content column: PageHeader + page body */}
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
              {activeInteraction ? (
                // ── Active interaction's detail page — replaces the "Home"
                // dashboard the moment a new assignment is started/quick-
                // dialed (see `activeInteraction` above). Just the record
                // header for now; the blank body below is where a real
                // case/contact detail view will go. Reverts back
                // automatically once the interaction is dismissed
                // (`activeInteractionId` clears). See agent-next-gen-v1's
                // own copy of this switch.
                <>
                  {showPageHeader && (
                    <PageHeader
                      // Hovering this record icon reveals the Designer side
                      // panel; clicking it is a real on/off toggle
                      // (`handleSidePanelIconToggle`) via the shared
                      // `PanelPinButton` atom — the same trigger `Panel`'s
                      // own internal pin button uses, just with its icon
                      // swapped to `User`. `iconAriaHidden={false}` because
                      // this slot is no longer decorative. See
                      // agent-next-gen-v1's own copy of this block for the
                      // full rationale.
                      icon={
                        <span
                          onMouseEnter={onSidePanelHoverStart}
                          onMouseLeave={sidePanelResizing ? undefined : onSidePanelHoverEnd}
                        >
                          <PanelPinButton
                            pinned={sidePanelPinned}
                            onToggle={handleSidePanelIconToggle}
                            icon={<User className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
                            pinnedLabel={sidePanelToggleLabel ?? "Toggle Overview"}
                            unpinnedLabel={sidePanelToggleLabel ?? "Toggle Overview"}
                          />
                        </span>
                      }
                      iconAriaHidden={false}
                      title={activeInteraction.customerName ?? "Customer"}
                      subtitle={activeInteraction.recordId}
                    />
                  )}
                  {/* One tab per open channel — kept in sync with the same
                      interaction's InteractionNavItem card via
                      currentChannelId/handleChannelSelect. Shown even with
                      just one channel open. See agent-next-gen-v1's own
                      copy of this block. */}
                  {showPageHeader && activeInteraction.channels.length > 0 && (
                    <TabList className="px-6 bg-lyra-bg-surface-base shrink-0 lyra-channel-tab-list-wrap">
                      {activeInteraction.channels.map((c) => {
                        const key = c.id ?? c.type;
                        return (
                          <ChannelTab
                            key={key}
                            type={c.type}
                            address={c.addressLabel}
                            messageCount={c.messageCount}
                            interactionId={c.interactionId}
                            active={(activeInteraction.currentChannelId ?? activeInteraction.channels[activeInteraction.channels.length - 1]?.id) === key}
                            onClick={() => handleChannelSelect(activeInteraction.id, key)}
                            onDismiss={() => {
                              if (activeInteraction.channels.length > 1) handleDismissChannel(activeInteraction.id, c);
                              else handleDismissInteraction(activeInteraction.id);
                            }}
                          />
                        );
                      })}
                    </TabList>
                  )}
                  <div className="flex-1 overflow-y-auto" />
                </>
              ) : (
                <>
                  {showPageHeader && (
                    <PageHeader
                      title="Home"
                      panelToggle={
                        showPanelToggle && showInteriorPanel ? "both"
                        : showPanelToggle ? "left"
                        : showInteriorPanel ? "right"
                        : undefined
                      }
                      panelPinned={effectivePinned}
                      onPanelToggle={effectivePinned ? () => setSidePanelOpen((v) => !v) : undefined}
                      onPanelHoverStart={!effectivePinned ? onSidePanelHoverStart : undefined}
                      onPanelHoverEnd={!effectivePinned ? onSidePanelHoverEnd : undefined}
                      onInnerPanelToggle={showInteriorPanel ? () => setInteriorPanelOpen((v) => !v) : undefined}
                      actions={
                        <>
                          <Button variant="outline">Export</Button>
                          <Button>
                            <Plus className="h-4 w-4" strokeWidth={1.5} />
                            New Case
                          </Button>
                        </>
                      }
                    />
                  )}
                  {/* Body row: main content + interior panel
                      Main content is lyra-ui's `AgentDashboard` (Templates/
                      Dashboards) — the same Home tab agent-next-gen-v1 renders,
                      promoted into a real shared component precisely so this
                      app doesn't need its own hand-copied version. See that
                      component's own doc comment (agent-dashboard.tsx). */}
                  <div className="relative flex flex-1 overflow-hidden">
                    <div className="flex flex-1 flex-col min-w-0 overflow-y-auto px-6 py-6">
                      <AgentDashboard
                        agentFirstName="John"
                        onRedial={(entry: AgentDashboardContactHistoryEntry) => {
                          // eslint-disable-next-line no-console
                          console.log("Redial:", entry.name);
                        }}
                        selectedQueueId={selectedQueueId}
                        onSelectQueueId={setSelectedQueueId}
                      />
                    </div>
                    {showInteriorPanel && (
                      <Panel
                        variant="interior"
                        side="right"
                        // Reuses this one docked slot for two different jobs —
                        // the pre-existing "Case Details" form and the queue
                        // drill-down opened from AgentDashboard — same
                        // dual-purpose pattern agent-next-gen-v1 uses for the
                        // same reason (only one detail view is ever relevant at
                        // a time). `selectedQueueId` takes priority in both the
                        // open condition and the content switch below.
                        open={interiorPanelOpen || Boolean(selectedQueueId)}
                        headerTitle={
                          selectedQueueId
                            ? AGENT_DASHBOARD_QUEUE_ITEMS.find((item) => item.id === selectedQueueId)?.name ?? "Queue"
                            : "Case Details"
                        }
                        onClose={() => {
                          setInteriorPanelOpen(false);
                          setSelectedQueueId(null);
                        }}
                      >
                        {selectedQueueId ? (
                          <AgentDashboardQueueDrilldown queueId={selectedQueueId} />
                        ) : (
                          <div className="flex flex-col gap-4 px-4 py-4">
                            <Input label="Subject" placeholder="Enter subject" />
                            <Input label="Priority" placeholder="Select priority" />
                            <Input label="Assignee" placeholder="Search agents" />
                            <Input label="Tags" placeholder="Add tags" />
                          </div>
                        )}
                      </Panel>
                    )}
                  </div>
                </>
              )}
            </div>

          </Container>

          {/* Notifications — float (CSS transitions, not keyframe animations — avoids compositor fill-mode flash) */}
          {notifVariant === "float" && notifMounted && (
            <div
              style={{
                ...getNotifFloatStyle(),
                pointerEvents: "none",
                visibility: notifState === "closed" ? "hidden" : "visible",
                opacity: notifState === "open" ? 1 : 0,
                transform: notifState === "open" ? "translateY(0)" : "translateY(-8px)",
                transition: notifState === "open"
                  ? "opacity 150ms ease, transform 150ms ease"
                  : "opacity 100ms ease, transform 100ms ease",
              }}
            >
              {notifPanel}
            </div>
          )}

          {/* AI Panel — float (same CSS transition pattern as Notifications) */}
          {aiVariant === "float" && aiMounted && (
            <div
              style={{
                ...getAiFloatStyle(),
                pointerEvents: "none",
                visibility: aiState === "closed" ? "hidden" : "visible",
                opacity: aiState === "open" ? 1 : 0,
                transform: aiState === "open" ? "translateY(0)" : "translateY(-8px)",
                transition: aiState === "open"
                  ? "opacity 150ms ease, transform 150ms ease"
                  : "opacity 100ms ease, transform 100ms ease",
              }}
            >
              {aiPanel}
            </div>
          )}

        </div>

        {/* Notifications — docked (sibling of containerRef so flex layout keeps it in-bounds) */}
        {notifVariant === "docked" && (
          <div className="pb-3" style={{
            width: notifState === "open" ? notifWidth : 0,
            marginRight: notifState === "open" ? 12 : 0,
            overflow: "hidden",
            flexShrink: 0,
            transition: notifIsResizing ? "none" : "width 250ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}>
            <div
              className="h-full animate-in fade-in-0 duration-150"
              style={{
                width: notifWidth,
                display: notifState === "open" ? "block" : "none",
              }}
            >
              {notifPanel}
            </div>
          </div>
        )}

        {/* AI Panel — docked (sibling of containerRef so flex layout keeps it in-bounds) */}
        {aiVariant === "docked" && (
          <div className="pb-3" style={{
            width: aiState === "open" ? aiWidth : 0,
            marginRight: aiState === "open" ? 12 : 0,
            overflow: "hidden",
            flexShrink: 0,
            transition: aiIsResizing ? "none" : "width 250ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}>
            <div
              className="h-full animate-in fade-in-0 duration-150"
              style={{
                width: aiWidth,
                display: aiState === "open" ? "block" : "none",
              }}
            >
              {aiPanel}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
