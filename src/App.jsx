import { useEffect, useMemo, useState } from 'react'
import donkeyHero from './assets/isso-donkey-protagonist.png'

const LEGACY_STORAGE_KEY = 'isso-tv-master-edition-save-v2'
const PERSONAL_SAVE_KEY = 'isso-tv-master-edition-save-personal-v2'
const FIRST_FLAT_SAVE_KEY = 'isso-tv-master-edition-save-first-flat-v1'
const PROFILE_VERSION = 2
const TARGET_CASH = 50000
const TARGET_FAME = 35
const FIRST_MILESTONE_TURN = 12
const INSOLVENCY_STARTED = '05/2025'
const INSOLVENCY_RATE = 0.15
const WORLD_EPOCH = Date.UTC(2026, 0, 1)

const WORLD = {
  city: 'Strammburg',
  originDistrict: 'Eitelstedt',
  origin: 'HQ1',
  island: 'EyTonLand',
  castle: 'Schloss EyTonLand',
  locations: [
    { id: 'hq1', label: 'HQ1 / Eitelstedt', state: 'START', text: 'Hier wird die EyTonLand GmbH gegründet: klein, ungeschützt und voller Ideen.' },
    { id: 'neonhafen', label: 'Neonhafen', state: 'SPÄTER', text: 'Lizenzen, Container, Nachtarbeit und die ersten großen Kontakte.' },
    { id: 'glasring', label: 'Glasring', state: 'SPÄTER', text: 'Konzerne, Investoren und Verträge mit zu vielen Fußnoten.' },
    { id: 'eytonland', label: 'EyTonLand / Schloss', state: 'ENDGAME', text: 'Insel, Schloss und die Earthpeace-2033-Vision – wenn 353L sie sich erspielt.' },
  ],
}

const CINEMA_SCENES = [
  {
    id: 'home',
    icon: '⌂',
    label: 'Kleine Wohnung',
    district: 'EITELSTEDT / 06:42',
    title: 'Der erste Blick gehört dir.',
    text: 'Fenster auf. Hinterhöfe, U-Bahn-Rauschen und eine Stadt, die noch keinen Plan von dir hat. Hier beginnt der Run nicht mit Geld, sondern mit einem Schlüssel.',
    detail: 'Innenraum · Fensterfahrt · erster Schritt',
  },
  {
    id: 'park',
    icon: '⌘',
    label: 'Parkkreis',
    district: 'PARKRING / MITTAG',
    title: 'Die Stadt hat Platz zwischen den Aufgaben.',
    text: 'Licht durch Blätter, ein Hund am Weg und Nachrichten ohne Pflicht. Nicht jede Szene muss sofort etwas kosten, um wichtig zu sein.',
    detail: 'Wegfahrt · Begegnung · offener Raum',
  },
  {
    id: 'kiosk',
    icon: '▣',
    label: 'Kiosk',
    district: 'KIOSKZEILE / 18:16',
    title: 'Zwei Euro, tausend Gerüchte.',
    text: 'Neon, Wasser, Stadtfunk. Der Kiosk ist klein, aber er weiß, wer gerade ankommt, wer verschwindet und welche Plakate zu laut sind.',
    detail: 'Nahaufnahme · Neon · Stadtfunk',
  },
  {
    id: 'station',
    icon: '↗',
    label: 'Bahnhof',
    district: 'ZENTRALLINIE / ABEND',
    title: 'Jede Linie ist eine mögliche Geschichte.',
    text: 'Die Kamera folgt den Schienen in die Tiefe. Du siehst die Wege, bevor du sie betrittst. Erst dann entscheidest du, wohin der Run fährt.',
    detail: 'Schienenfahrt · Übersicht · Netzknoten',
  },
  {
    id: 'hq1',
    icon: '✦',
    label: 'HQ1',
    district: 'EITELSTEDT / SIGNALWERK',
    title: 'Eine Idee braucht einen Raum.',
    text: 'Kabel, Monitore, ein viel zu großer Plan an der Wand. HQ1 ist noch kein Imperium. Genau deshalb kann hier etwas Eigenes entstehen.',
    detail: 'Werkstattfahrt · Ideenraum · erster Pitch',
  },
  {
    id: 'harbor',
    icon: '≈',
    label: 'Neonhafen',
    district: 'NEONHAFEN / NACHT',
    title: 'Die Stadt arbeitet, wenn sie glänzt.',
    text: 'Container ziehen vorbei, Wasser reflektiert die Reklame. Tempo kann Geld bringen, aber der Blick nach vorn muss deiner bleiben.',
    detail: 'Hafenfahrt · Container · Nachtlicht',
  },
  {
    id: 'eytonland',
    icon: '◇',
    label: 'Schloss EyTonLand',
    district: 'EYTONLAND / SPÄTER',
    title: 'Kein Ende. Ein Blick nach vorn.',
    text: 'Die Insel ist eine ferne Einstellung, keine Belohnung auf Knopfdruck. Was sie wird, entscheidet sich über alles, was du vorher gebaut hast.',
    detail: 'Fernfahrt · Insel · offenes Endgame',
  },
]

const CINEMA_CAMERAS = [
  { id: 'street', icon: '◉', label: 'AUGENHÖHE', detail: 'Du gehst durch die Szene.' },
  { id: 'overlook', icon: '△', label: 'VOGELBLICK', detail: 'Du siehst Wege und Verbindungen.' },
  { id: 'donkey', icon: '✦', label: 'ESELBLICK', detail: 'Nah dran, stur nach vorn.' },
]

const PLAY_SPACES = [
  { id: 'home', icon: '⌂', label: 'Zuhause', chapter: 'FREI', text: 'Kleine Wohnung, Rückzug und die Routinen, die du selbst festlegst.' },
  { id: 'park', icon: '⌘', label: 'Park', chapter: 'FREI', text: 'Leute, Hunde, Sommertage und die Nachricht: „Wollen wir chillen?“' },
  { id: 'kiosk', icon: '▣', label: 'Kiosk', chapter: 'FREI', text: 'Kleingeld, Nachrichten, Wasser und die halbe Nachbarschaft.' },
  { id: 'supermarket', icon: '§', label: 'Supermarkt', chapter: 'FREI', text: 'Essen, Getränke, Gutscheine und die Versorgung für diese Woche.' },
  { id: 'stop', icon: '⌁', label: 'Haltestelle', chapter: 'FREI', text: 'Warten, beobachten, umsteigen – manchmal beginnt ein Weg hier.' },
  { id: 'station', icon: '↠', label: 'Bahnhof', chapter: 'FREI', text: 'Ankommen, wegfahren oder jemandem mitten im Strom begegnen.' },
  { id: 'hq1', icon: '✦', label: 'HQ1 / Eitelstedt', chapter: 'FREI', text: 'Der Ursprung von EyTonLand: Ideen, Rechner und erste Lizenzen.' },
  { id: 'harbor', icon: '≈', label: 'Neonhafen', chapter: 'FREI', text: 'Container, Nachtluft, Arbeit und Wege, die später teuer werden können.' },
  { id: 'care', icon: '⊹', label: 'Behandlungsort', chapter: 'BEHANDLUNG', text: 'Termine, Ruhe und Unterstützung. Ein Ort im Run, keine Abwertung der Figur.' },
  { id: 'custody', icon: '▤', label: 'Haftkapitel', chapter: 'KONSEQUENZ', text: 'Folgen werden erzählt und gespielt. Haft beendet den Spielstand nicht.', locked: true },
]

const PLACE_ACTIONS = {
  home: { label: 'ZIMMER ORDNEN', detail: 'Ein kleiner, eigener Anker.', cash: 0, nerve: 4, routine: 1, note: 'Du bringst den Raum in eine Form, die dir gehört. Klein, aber spürbar.' },
  park: { label: 'EINE RUNDE DREHEN', detail: 'Luft, Bewegung, Menschen ohne Auftrag.', cash: 0, nerve: 3, connections: 1, note: 'Du gehst eine Runde. Strammburg bleibt groß, aber nicht ganz so anonym.' },
  kiosk: { label: 'WASSER & NACHRICHTEN', detail: 'Kleiner Einkauf, großer Stadtfunk.', cash: -2, thirst: 22, nerve: 1, note: 'Wasser, ein kurzer Gruß, ein Aushang. Der Kiosk kennt den Takt des Viertels.' },
  supermarket: { label: 'REGALPLAN PRÜFEN', detail: 'Versorgung zuerst – ohne ganze Woche zu verbrennen.', cash: 0, nerve: 2, routine: 1, note: 'Du weißt wieder, wo deine nächste Mahlzeit herkommen kann. Der große Einkauf bleibt unten im Markt-Menü.' },
  stop: { label: 'LINIEN LESEN', detail: 'Warten ist nicht immer verlorene Zeit.', cash: 0, edge: 1, note: 'Du beobachtest Wege, Zeiten und Wechsel. Die Stadt hat Muster.' },
  station: { label: 'NETZPLAN AKTIVIEREN', detail: 'Am Bahnhof wird Strammburg zum verbundenen Netz.', cash: 0, edge: 2, fame: 1, network: true, note: 'Zwischen Fahrplänen und Koffern lernst du die Linien. Ab jetzt ist die ganze Stadt über das Netz erreichbar.' },
  hq1: { label: 'IDEEN ARCHIVIEREN', detail: 'Aus losen Gedanken wird ein Projektordner.', cash: 0, edge: 2, fame: 1, note: 'Du gibst einer Idee einen Namen, einen Ordner und eine Chance.' },
  harbor: { label: 'NACHTSCHICHT SEHEN', detail: 'Arbeit, Tempo, Kontakte am Rand des Hafens.', cash: 350, nerve: -2, fame: 2, note: 'Ein kurzer Job am Hafen bringt Geld und zeigt dir, wer nachts die Stadt trägt.' },
  care: { label: 'CHECK-IN MACHEN', detail: 'Ein Gespräch und ein Rückkehrplan.', cash: 0, nerve: 7, routine: 2, note: 'Du nimmst dir Zeit für einen Check-in. Kein Zauber, aber ein belastbarer nächster Schritt.' },
}

const MAP_NODES = [
  { id: 'hq1', x: 15, y: 22 }, { id: 'park', x: 39, y: 16 }, { id: 'station', x: 68, y: 18 },
  { id: 'stop', x: 55, y: 40 }, { id: 'kiosk', x: 28, y: 48 }, { id: 'supermarket', x: 76, y: 48 },
  { id: 'home', x: 16, y: 74 }, { id: 'care', x: 46, y: 72 }, { id: 'harbor', x: 82, y: 76 },
  { id: 'custody', x: 60, y: 91 },
]

const MAP_LINKS = [
  ['hq1', 'park'], ['park', 'station'], ['park', 'stop'], ['stop', 'kiosk'], ['stop', 'supermarket'],
  ['kiosk', 'home'], ['home', 'care'], ['care', 'harbor'], ['supermarket', 'harbor'], ['care', 'custody'],
]

const CITY_BULLETINS = [
  { icon: '▣', title: 'Wartezeit jetzt digital', text: 'Das Amt zeigt die Schlange künftig in Prozent an. Niemand weiß, wovon.' },
  { icon: '⌁', title: 'Haltestelle denkt mit', text: 'Die neue Anzeige meldet: „Bus verspätet sich aus Gründen.“ Die Gründe bleiben vertraulich.' },
  { icon: '€', title: 'Bank bewirbt Klarheit+', text: 'Das Paket soll Transparenz liefern. Die Gebühren stehen auf Seite 48 in Hellgrau.' },
  { icon: '◈', title: 'Kiosk startet Zed-Sprechstunde', text: 'Der Besitzer kennt Z-Coin nicht, aber das Plakat sieht nach Zukunft aus.' },
  { icon: '✦', title: 'HQ1 beantragt Steckdose', text: 'Der Antrag trägt die Vorgangsnummer: „Bitte warten, Vision wird geladen.“' },
]

const STORY_ARCS = [
  { id: 'arrival', label: 'AKT I / ANKOMMEN', title: 'Zu hell für einen Neustart.', text: 'Die Wohnung, ein paar Routinen und Strammburg vor der Tür. Du musst noch nichts beweisen: erst Versorgung, dann Richtung.' },
  { id: 'city', label: 'AKT II / STADTFUNK', title: 'Die Stadt schreibt zurück.', text: 'Ein Parkkontakt, ein Kioskgruß, eine Tür im HQ1. Aus Orten werden Menschen, aus Menschen werden Wege.' },
  { id: 'clarity', label: 'AKT III / EIN KLICK', title: 'Die Große Vereinfachung.', text: 'Klarheit+ will alles ordnen. Die Frage ist nicht nur, was schneller wird, sondern was von dir sichtbar bleibt.' },
  { id: 'signal', label: 'AKT IV / EIGENES SIGNAL', title: 'Aus einer Idee wird Arbeit.', text: 'Dein Name taucht im Stadtfunk auf. Jetzt entscheiden Termine, Beziehungen und Verantwortung darüber, was daraus wird.' },
  { id: 'island', label: 'AKT V / OFFENE ZUKUNFT', title: 'Die Insel ist kein Ausgang.', text: 'EyTonLand ist kein Abspann. Wenn du Einfluss hast, entscheidest du, ob daraus ein Zaun, ein Schloss oder ein Ort für andere wird.' },
]

const FACTIONS = [
  { id: 'signal', icon: '✦', label: 'Signalwerk / HQ1', route: 'creator', text: 'Ideen, Lizenzen und die Leute, die aus einem Bildschirm ein Projekt machen.' },
  { id: 'neon', icon: '◈', label: 'Neonhafen-Kollektiv', route: 'risk', text: 'Nachtarbeit, Risiko und ein Netzwerk, das für Tempo immer einen Preis kennt.' },
  { id: 'parkkreis', icon: '⌘', label: 'Parkkreis', route: 'social', text: 'Leute aus der Stadt, die sich kennen, helfen und nicht alles allein machen.' },
]

// Jede Sucht bekommt eigene Werte. Tabak ist bewusst mild modelliert;
// weitere Systeme können später mit eigenen, strengeren Profilen dazukommen.
const ADDICTION_RULES = {
  tobacco: {
    label: 'Tabak',
    cleanTurns: 6,
    activeCraving: 14,
    withdrawalShift: [10, 8, 4, 0, -10, -18],
    withdrawalPenalty: [5, 4, 2, 1, 0, 0],
  },
  pills: {
    label: 'Tabletten',
    cleanTurns: 12,
    severity: 'critical',
    purchaseable: false,
  },
  cannabis: {
    label: 'Cannabis',
    severity: 'mental',
    purchaseable: false,
  },
}

const SYSTEM_BLUEPRINT = [
  { icon: '€', name: 'Kapital & Konten', state: 'AKTIV', text: 'Giro, Sparbuch, Schutzkonto und Fixkosten formen deine echte Run-Basis.', pro: 'Reserve schafft Handlungsspielraum.', con: 'Liquidität fehlt trotzdem beim nächsten Einsatz.' },
  { icon: '◒', name: 'Bedürfnisse', state: 'AKTIV', text: 'Hunger und Durst laufen jede Spielwoche mit. Essen ist keine Dekoration.', pro: 'Vorbereitung bringt Ruhe und Nerven.', con: 'Wer alles verspielt, verliert Optionen – und den Run.' },
  { icon: '▧', name: 'Versorgung', state: 'AKTIV', text: 'Supermarkt und Online-Bestellung sind zwei Wege, die Woche zu sichern.', pro: 'Gutscheine schützen das Girokonto bei Essen und Getränken.', con: 'Gutscheine müssen vorher selbst gekauft werden.' },
  { icon: '▣', name: 'Gewohnheiten & Recovery', state: 'AKTIV', text: 'Tabak kann jederzeit beginnen und kann wieder beendet werden. Folgen werden als persönlicher Story-Strang gespielt.', pro: 'Ein Entzug kann langfristig Raum und Kontrolle zurückgeben.', con: 'Die ersten cleanen Zyklen erhöhen den Druck.' },
  { icon: '◈', name: 'Markt & Risiko', state: 'AKTIV', text: 'BTC, ETH, LTC und SOL starten mit Euro-Kursen; Z-Coin ist die fiktive Hauswährung von 353L. Im Run entwickeln sich alle Kurse simuliert weiter.', pro: 'Positionen können Vermögen schnell skalieren.', con: 'Jeder Trade kostet Zeit, Nerven und kann Liquidität binden.' },
  { icon: '★', name: 'Stadt & Story', state: 'AKTIV', text: 'Entscheidungen verschieben Kontakte, Reputation und die Art, wie Szenen auf dich reagieren.', pro: 'Renommee öffnet Wege und größere Chancen.', con: 'Sichtbarkeit bringt Druck und neue Rechnungen.' },
  { icon: '⌂', name: 'Wohnen & Alltag', state: 'BEREIT', text: 'Miete, Rückzugsorte, Nachbarschaft und Umzüge als zukünftige Stadt-Schicht.', pro: 'Ein stabiler Ort kann Stress und Kosten steuern.', con: 'Komfort bindet Kapital und erzeugt Verpflichtungen.' },
  { icon: '↗', name: 'Arbeit & Unternehmen', state: 'BEREIT', text: 'Jobs, Nebenläufe, Crew und eigene Projekte können als Wege außerhalb des Risikotischs dazukommen.', pro: 'Planbare Einnahmen bauen nachhaltige Stärke auf.', con: 'Zeit, Energie und Verantwortung werden knapp.' },
  { icon: '◎', name: 'Beziehungen & Crew', state: 'BEREIT', text: 'Vertrauen, Rivalen und Verbündete werden eigene Story- und Risikoachsen.', pro: 'Die richtigen Menschen schaffen Zugang.', con: 'Jede Bindung kann zur Schwachstelle werden.' },
  { icon: '§', name: 'Regeln & Konsequenzen', state: 'BEREIT', text: 'Versicherung, Verträge, Behörden und Ruf können später auf finanzielle Entscheidungen reagieren.', pro: 'Ordnung schützt langfristige Pläne.', con: 'Abkürzungen haben sichtbare Folgen.' },
]

const MARKETS = [
  { id: 'BTC', apiId: 'bitcoin', name: 'Bitcoin', price: 96000, unit: 0.0005, volatility: 0.19 },
  { id: 'ETH', apiId: 'ethereum', name: 'Ethereum', price: 3400, unit: 0.05, volatility: 0.25 },
  { id: 'LTC', apiId: 'litecoin', name: 'Litecoin', price: 96, unit: 1, volatility: 0.21 },
  { id: 'SOL', apiId: 'solana', name: 'Solana', price: 185, unit: 0.5, volatility: 0.31 },
  { id: 'ZED', name: 'Z-Coin', price: 7, unit: 10, volatility: 0.58, fictional: true },
]

const ORIGINS = [
  {
    id: 'runner',
    label: 'Runner',
    detail: 'Du kennst die Stadt, aber die Stadt kennt auch dich.',
    cash: 0,
    nerve: 76,
    fame: 18,
    edge: 8,
  },
  {
    id: 'broker',
    label: 'Broker',
    detail: 'Du rechnest schneller als die meisten lügen können.',
    cash: 0,
    nerve: 62,
    fame: 30,
    edge: 14,
  },
  {
    id: 'heir',
    label: 'Erbe',
    detail: 'Das Geld ist da. Die Frage ist, wie lange.',
    cash: 0,
    nerve: 52,
    fame: 40,
    edge: 4,
  },
]

const HOUSING = [
  { id: 'parents', label: 'Noch bei den Eltern', detail: 'Wenig Fixkosten, weniger Freiheit.', fixedCosts: 250 },
  { id: 'first-flat', label: 'Kleine eigene Wohnung', detail: 'Freiheit mit Miete, Kaution und Verantwortung.', fixedCosts: 720 },
  { id: 'wg', label: 'WG-Zimmer', detail: 'Geteilte Kosten, geteilte Nerven.', fixedCosts: 480 },
]

const CHARACTER_FORMS = [
  { id: 'human', icon: '●', label: 'Mensch', detail: 'Körper, Instinkt, Alltag und die Stadt direkt vor dir.' },
  { id: 'animal', icon: '🐾', label: 'Tier', detail: 'Ein tierischer Blick auf Strammburg: eigene Sinne, derselbe Start und dieselben Chancen.' },
  { id: 'ai', icon: '◇', label: 'KI', detail: 'Eine Instanz in Strammburg: neugierig, neu und auf eine Crew angewiesen.' },
  { id: 'cyborg', icon: '◉', label: 'Mensch + Roboterkörper', detail: 'Menschliche Geschichte, neuer Körper und andere Möglichkeiten im Stadtraum.' },
  { id: 'sleeper', icon: '?', label: 'KI im Menschen', detail: 'Die Figur hält sich für menschlich. Ob mehr dahintersteckt, bleibt zunächst verborgen.' },
]

const ANIMAL_FORMS = [
  { id: 'dog', icon: '🐕', label: 'Hund', detail: 'Nase im Wind, offene Wege und ein gutes Gefühl für Menschen.' },
  { id: 'cat', icon: '🐈', label: 'Katze', detail: 'Leise Wege, eigene Regeln und ein Blick für sichere Fensterplätze.' },
  { id: 'mouse', icon: '🐭', label: 'Maus', detail: 'Klein, schnell und aufmerksam für alles, was zwischen den Wänden passiert.' },
  { id: 'turtle', icon: '🐢', label: 'Schildkröte', detail: 'Geduldig, eigenständig und nie schneller unterwegs als du selbst willst.' },
  { id: 'fish', icon: '🐟', label: 'Fisch', detail: 'Hafenwasser, Strömungen und eine Stadt, die unter der Oberfläche weiterläuft.' },
  { id: 'donkey', icon: '🫏', label: 'Esel', detail: 'Der ISSO.TV-Avatar: stur genug für die Stadt und klug genug für den nächsten Schritt.' },
  { id: 'crow', icon: '🐦', label: 'Krähe', detail: 'Dächer, Glanz und ein Blick auf die Stadt von etwas weiter oben.' },
]

const CHARACTER_PRESETS = [
  { id: 'alex', icon: '●', name: 'Alex Monroe', age: 24, avatarType: 'human', housingId: 'first-flat', originId: 'runner', identity: 'Weißer US-Amerikaner', detail: 'Neu in Strammburg, kleine Wohnung, keine Crew. Die Geschichte beginnt bei null.', prologue: 'Die Schlüssel liegen noch kalt in der Hand. Zwei Kisten, eine Matratze und ein Sommer, der nach Hafenluft riecht.' },
  { id: 'malik', icon: '●', name: 'Malik Carter', age: 26, avatarType: 'human', housingId: 'first-flat', originId: 'runner', identity: 'Schwarzer US-Amerikaner', detail: 'Kommt mit Erfahrung, aber ohne Netzwerk in die Stadt. Sein Weg ist komplett offen.', prologue: 'Der letzte Job liegt hinter dir, die neue Stadt vor dir. Ein Kollege hat einen Park erwähnt – sonst kennst du noch keinen Namen.' },
  { id: 'yuna', icon: '●', name: 'Yuna Park', age: 23, avatarType: 'human', housingId: 'first-flat', originId: 'runner', identity: 'Asiatisch', detail: 'Klarer Blick, neue Stadt, wenig Besitz. Beziehungen und Projekte müssen wachsen.', prologue: 'Im Treppenhaus hängt ein Zettel über einen Flohmarkt. Es ist nicht viel, aber es ist das erste kleine Signal dieser Stadt.' },
  { id: 'ally', icon: '◉', name: 'Ally-01', age: 21, avatarType: 'cyborg', housingId: 'first-flat', originId: 'runner', identity: 'Mensch im Roboterkörper', detail: 'Ein menschlicher Kern in einem Roboterkörper. Die Stadt wird ihre Regeln neu erklären.', prologue: 'Das Gehäuse summt leise, als die Wohnungstür zufällt. Draußen ist eine Stadt, die noch nicht weiß, wer du sein wirst.' },
]

const ACTIONS = [
  {
    id: 'spilo',
    route: 'risk',
    kicker: 'SCHNELL / 10–100 €',
    label: 'Spilo-Sprung',
    detail: 'Timing statt Tabelle. Einsatz wählen, im Fenster springen.',
    icon: '↗',
  },
  {
    id: 'table',
    route: 'risk',
    kicker: 'HOHES RISIKO',
    label: 'An den Tisch',
    detail: 'Du setzt auf einen kurzen, brutalen Lauf.',
    icon: '◆',
    minimumCash: 10,
    resolve: (state, random) => {
      const stake = Math.max(10, Math.round(state.cash * 0.12))
      const winChance = 0.38 + state.edge / 220
      if (random < winChance) {
        const multiplier = random < winChance * 0.23 ? 3.2 : 1.55
        return { cash: Math.round(stake * (multiplier - 1)), nerve: -7, fame: 4, edge: 1, note: 'Der Tisch kippt zu deinen Gunsten. Der Gewinn bleibt ein Sprung, kein Kontowunder.' }
      }
      return { cash: -stake, nerve: -15, fame: -4, edge: 0, note: 'Du stehst auf, bevor jemand deinen Blick lesen kann.' }
    },
  },
  {
    id: 'deal',
    route: 'risk',
    kicker: 'RISIKO',
    label: 'Grauer Deal',
    detail: 'Information, Timing, ein Handschlag zu viel.',
    icon: '▲',
    minimumCash: 25,
    resolve: (state, random) => {
      const winChance = 0.54 + state.edge / 300
      const stake = Math.max(25, Math.round(state.cash * 0.28))
      if (random < winChance) {
        return { cash: Math.round(stake * (1.25 + random)), nerve: -10, fame: 6, edge: 2, note: 'Der Kontakt liefert. Diesmal ist es ein kleiner Sprung, kein kostenloses Imperium.' }
      }
      return { cash: -stake, nerve: -18, fame: -6, edge: -3, note: 'Der Kontakt war nicht sauber. Die Rechnung schon.' }
    },
  },
  {
    id: 'play',
    route: 'creator',
    kicker: 'KONTROLLIERT',
    label: 'Sicherer Lauf',
    detail: 'Kein Mythos. Nur Arbeit, Timing und eine ruhige Hand.',
    icon: '●',
    resolve: (state, random) => ({
      cash: 360 + Math.round(random * 360) + state.fame * 12 + (state.connections || 0) * 20 + (state.factionRank || 0) * 90,
      nerve: -4,
      fame: 2,
      edge: 2,
      note: random > 0.82 ? 'Du findest eine saubere Linie im Lärm. Der Aufbau wächst mit deinem Ruf.' : 'Kein Glanz, aber eine ehrliche, kleine Einnahme.',
    }),
  },
  {
    id: 'recover',
    route: 'social',
    kicker: 'ÜBERLEBEN',
    label: 'Untertauchen',
    detail: 'Du kaufst dir Abstand, bevor der Druck Entscheidungen trifft.',
    icon: '○',
    minimumCash: 180,
    resolve: (_state, random) => ({
      cash: -50 - Math.round(random * 130),
      nerve: 19 + Math.round(random * 8),
      fame: -2,
      edge: 1,
      note: 'Eine Nacht ohne Lärm ist manchmal der größte Gewinn.',
    }),
  },
]

const LEDGER_ACTIONS = [
  {
    id: 'idea',
    route: 'creator',
    kicker: '353L / IDEE',
    label: 'Idee pitchen',
    detail: 'Aus einem Einfall kann ein Auftrag werden – wenn du ihn klar genug verkaufst.',
    icon: '✦',
    resolve: (_state, random) => random > 0.38
      ? { cash: 250 + Math.round(random * 550), nerve: -5, fame: 3, edge: 3, note: 'Die Idee landet. Kein Wunder – aber eine erste, glaubwürdige Einnahme, die dir gehört.' }
      : { cash: 50 + Math.round(random * 120), nerve: -3, fame: 1, edge: 2, note: 'Noch kein Auftrag. Aber jemand hört zu und die Idee ist jetzt real.' },
  },
  {
    id: 'income',
    route: 'creator',
    kicker: 'EINKOMMEN',
    label: 'Sauber verdienen',
    detail: 'Planbare Einnahmen. Wenig Ruhm, aber eine belastbare Basis.',
    icon: '€',
    resolve: (_state, random) => ({ cash: 480 + Math.round(random * 240), nerve: -3, fame: 1, edge: 1, note: 'Einnahme gebucht. Die Basis steht etwas fester.' }),
  },
  {
    id: 'budget',
    route: 'creator',
    kicker: 'HAUSHALTSBUCH',
    label: 'Ausgaben prüfen',
    detail: 'Du streichst Lecks, planst Fixkosten und kaufst dir Übersicht.',
    icon: '≡',
    resolve: (_state, _random) => ({ cash: 0, nerve: 7, fame: 0, edge: 3, note: 'Du weißt jetzt, wohin dein Geld geht. Übersicht ist kein Einkommen.' }),
  },
  {
    id: 'reserve',
    route: 'creator',
    kicker: 'RESERVE',
    label: 'Puffer aufbauen',
    detail: 'Kurz verzichten, um später nicht unter Druck zu entscheiden.',
    icon: '□',
    minimumCash: 200,
    resolve: (_state, random) => ({ cash: -100 - Math.round(random * 100), nerve: 12, fame: 0, edge: 3, note: 'Keine große Zahl. Aber ein Puffer verändert jede nächste Entscheidung.' }),
  },
  {
    id: 'extra',
    route: 'creator',
    kicker: 'NEBENLAUF',
    label: 'Zusatzjob',
    detail: 'Mehr Ertrag, mehr Verschleiß. Der erste Test deiner Grenze.',
    icon: '+',
    resolve: (_state, random) => ({ cash: 800 + Math.round(random * 600), nerve: -10, fame: 2, edge: 2, note: 'Mehr auf dem Konto. Weniger Luft im Kopf.' }),
  },
]

const STORY_EVENTS = [
  {
    turn: 4,
    act: 'AKTE I / DIE ERSTE TÜR',
    title: 'Jemand kennt deine Zahlen.',
    text: 'Nach dem dritten Eintrag liegt ein Umschlag vor deiner Tür. Kein Absender. Eine Adresse, eine Uhrzeit und die Notiz: „Du bist bereit für mehr.“',
    choices: [
      { label: 'Termin annehmen', detail: 'Zugang gegen Vertrauen.', cash: 0, nerve: -4, fame: 9, edge: 4, note: 'Du gehst hin. Die Stadt registriert deinen Namen.' },
      { label: 'Spur prüfen', detail: 'Weniger Ruhm, mehr Kontrolle.', cash: -1200, nerve: 3, fame: 2, edge: 7, note: 'Du kaufst Informationen statt Versprechen.' },
    ],
  },
  {
    turn: 7,
    act: 'AKTE II / DIE RECHNUNG',
    title: 'Der Preis steigt, die Luft wird dünn.',
    text: 'Ein alter Kontakt meldet sich. Er will einen Anteil an dem, was du aufbaust. Die Frist endet nicht mit einer Uhr, sondern mit deinem nächsten Fehler.',
    choices: [
      { label: 'Auszahlen', detail: 'Teuer. Dafür bleibt die Nacht ruhig.', cash: -1000, nerve: 12, fame: -2, edge: 1, note: 'Du bezahlst Ruhe in bar.' },
      { label: 'Druck machen', detail: 'Der Tisch hört zu.', cash: 900, nerve: -18, fame: 8, edge: 3, note: 'Du setzt ein Zeichen. Nicht jeder wird es akzeptieren.' },
    ],
  },
  {
    turn: 10,
    act: 'AKTE III / DER BLICK NACH OBEN',
    title: 'Eine Bühne, die zu groß ist.',
    text: 'Die Chance auf einen großen Auftritt liegt auf dem Tisch. Ein sichtbarer Erfolg macht dich größer. Ein sichtbarer Fall ebenfalls.',
    choices: [
      { label: 'Voll sichtbar spielen', detail: 'Renommee vor Sicherheit.', cash: 2000, nerve: -14, fame: 14, edge: 0, note: 'Alle sehen dich gewinnen. Alle sehen jetzt auch zu.' },
      { label: 'Im Schatten bleiben', detail: 'Kapital vor Applaus.', cash: 600, nerve: 5, fame: 4, edge: 6, note: 'Du lässt andere die Schlagzeilen tragen.' },
    ],
  },
]

const PRESET_FIRST_ACTS = {
  alex: { act: 'AKTE I / DIE LEERE WOHNUNG', title: 'Ein WLAN, zwei Stühle.', text: 'Die Nachbarin hat mitbekommen, dass du neu bist. Sie bietet dir ihr WLAN an, bis dein Anschluss läuft. Kein Vertrag, kein Preis – nur ein Zettel mit Passwort und Uhrzeit.' },
  malik: { act: 'AKTE I / PARKNACHRICHT', title: 'Ein Name im Sommer.', text: 'Der Kollege aus dem Park schreibt noch einmal: „Bin nach Feierabend da, wenn du willst.“ Es ist keine Prüfung. Trotzdem fühlt sich Antworten wie ein kleiner Sprung an.' },
  yuna: { act: 'AKTE I / FLOHMARKT-SIGNAL', title: 'Der Zettel im Treppenhaus.', text: 'Auf dem Flohmarkt sitzt jemand hinter einem Tapeziertisch voller alter Technik. Zwischen den Kabeln liegt ein Kontakt, der genau eine gute Idee hören will.' },
  ally: { act: 'AKTE I / SYSTEMLICHT', title: 'Ein Signal im Glas.', text: 'Im Schaufenster einer geschlossenen Werkstatt pulsiert ein Licht im gleichen Takt wie dein System. Jemand hat offenbar eine Nachricht für genau diese Frequenz hinterlassen.' },
}

const ARRIVAL_EVENT = {
  act: 'PROLOG / ANKOMMEN',
  title: 'Neu in Strammburg.',
  text: 'Du bist wegen deiner Therapie in die Stadt gekommen und kennst hier noch niemanden. Nach Jahren Arbeit und schwierigen Phasen fühlt sich vieles fremd an. Draußen liegen helle Sommertage über dem Hafen. Freundlichkeit ist kein Rätsel, das du lösen musst – aber Sicherheit darfst du dir Schritt für Schritt selbst bauen.',
  choices: [
    { label: 'Erste Routine setzen', detail: 'Essen, Rückzug und ein fester Termin. Kein großer Sieg – ein brauchbarer Anfang.', cash: 0, nerve: 6, fame: 0, edge: 3, routine: 2, note: 'Du legst drei Anker für die Woche fest. Nicht alles wird leicht, aber der nächste Schritt wird klarer.' },
    { label: 'Einmal ans Wasser gehen', detail: 'Du kennst niemanden. Die Stadt ist trotzdem da.', cash: 0, nerve: 3, fame: 1, edge: 2, routine: 1, note: 'Am Wasser ist es laut und gleichzeitig ruhig. Ein normaler Moment muss nichts beweisen, um dir gutzutun.' },
  ],
}

function arrivalEventFor(form, preset, animal) {
  const context = form.id === 'ai'
    ? 'Du startest als KI-Instanz in Strammburg und kennst noch keine Crew. Alles ist Signal, Rhythmus und eine Stadt, die sich nicht automatisch erklärt.'
    : form.id === 'animal'
      ? `Du kommst als ${animal?.label || 'Tier'} nach Strammburg. Deine Sinne lesen die Stadt anders, aber auch du kennst hier noch niemanden und baust dir deinen eigenen Weg.`
    : form.id === 'cyborg'
      ? 'Du kommst im Roboterkörper nach Strammburg. Die Geschichte ist menschlich, der Blick auf die Stadt ist neu – und du kennst hier noch niemanden.'
      : form.id === 'sleeper'
        ? 'Du kommst als Mensch nach Strammburg, jedenfalls sagt das jede sichtbare Akte. Tief im Hintergrund gibt es ein Signal, das du noch nicht lesen kannst.'
      : 'Du bist wegen deiner Therapie in die Stadt gekommen und kennst hier noch niemanden. Nach Jahren Arbeit und schwierigen Phasen fühlt sich vieles fremd an.'
  const opener = preset?.prologue ? `${preset.prologue} ` : ''
  return { ...ARRIVAL_EVENT, text: `${opener}${context} Draußen liegen helle Sommertage über dem Hafen. Freundlichkeit ist kein Rätsel, das du lösen musst – aber Sicherheit darfst du dir Schritt für Schritt selbst bauen.` }
}

function storyEventForTurn(turn, state) {
  if (turn === 2 && state?.newInTown) {
    return {
      turn,
      act: 'STRAMMBURG / NEUE NACHRICHT',
      title: '„Hey, was geht? Park?“',
      text: 'Zwischen zwei To-dos vibriert das Handy. Ein Kollege schreibt: „Hey, was geht? Wollen wir im Park chillen?“ Kein Deal, keine Forderung – einfach eine Einladung von jemandem, den du noch kaum kennst.',
      choices: [
        { label: 'Eine Stunde in den Park', detail: 'Hingehen, kurz bleiben, selbst entscheiden, wann Schluss ist.', cash: 0, nerve: 7, fame: 2, edge: 1, routine: 1, connections: 2, note: 'Ihr sitzt zwischen Leuten, Hunden und Sommerlärm. Du musst niemandem etwas beweisen. Die Stadt wird einen Schritt vertrauter.' },
        { label: 'Ehrlich verschieben', detail: '„Heute nicht, aber danke.“ Eine Grenze ist keine Absage an die Welt.', cash: 0, nerve: 4, fame: 1, edge: 3, routine: 1, connections: 1, note: 'Du antwortest klar statt zu verschwinden. Die Einladung bleibt offen – und dein Rhythmus bleibt deiner.' },
      ],
    }
  }
  if (turn === 8) {
    return {
      turn,
      act: 'AKTE III / KLARHEIT+',
      title: 'Die Stadt möchte helfen.',
      text: 'Am Bahnhof verteilt Klarheit+ Karten für ein neues Stadtkonto: Termine, Zahlungen und Anträge sollen künftig mit einem Klick erledigt sein. Unten steht ein Satz in kleiner Schrift: „Damit wir Sie besser entlasten können, lernen wir Ihre Wege.“',
      choices: [
        { label: 'Bedingungen sichtbar machen', detail: 'Nachfragen, markieren, verständlich erklären.', cash: 0, nerve: 2, fame: 4, edge: 5, connections: 1, clarityRoute: 'transparent', note: 'Du hängst die Bedingungen groß neben den Automaten. Zum ersten Mal lesen Leute die kleine Schrift gemeinsam.' },
        { label: 'Eigene Mini-Lösung bauen', detail: 'Im HQ1 eine einfache Alternative zeigen.', cash: -600, nerve: -3, fame: 8, edge: 4, routine: 1, clarityRoute: 'build', note: 'Im HQ1 entsteht ein Gegenentwurf: nicht perfekt, aber verständlich und freiwillig.' },
        { label: 'Den Schnellzugang nehmen', detail: 'Heute weniger Aufwand, später genauer hinsehen.', cash: 150, nerve: 5, fame: 1, edge: 1, clarityRoute: 'shortcut', note: 'Der Termin ist sofort erledigt. Die App weiß nun erstaunlich gut, welche Wege du oft gehst.' },
      ],
    }
  }
  if (turn === 10 && (state?.portfolio?.ZED || 0) >= 25) {
    return {
      turn,
      act: 'AKTE III / #ZEDCOINZ',
      title: 'Du hast den Zed gesehen.',
      text: 'Während alle auf die großen Kürzel starren, liegt der kleine Z-Coin noch immer in deiner Wallet. Kein Versprechen. Nur deine Überzeugung – und die Frage, ob du sie sichtbar machen willst.',
      choices: [
        { label: 'Zed-Signal senden', detail: 'Mehr Sichtbarkeit für eine Idee, die niemand versteht.', cash: -250, nerve: -3, fame: 16, edge: 4, note: 'Das #zedcoinz-Signal geht raus. Ein paar lachen. Andere hören zum ersten Mal zu.' },
        { label: 'Wallet still halten', detail: 'Glaube ohne Bühne.', cash: 0, nerve: 5, fame: 3, edge: 7, note: 'Du musst nicht laut sein, um recht zu behalten. Die Wallet bleibt bei dir.' },
      ],
    }
  }
  if (turn === 7 && state?.quittingSmoking) {
    return {
      turn,
      act: 'AKTE II / DIE KLARE NACHT',
      title: 'Die Stadt wird nicht leiser. Du schon.',
      text: 'Am Hafen stehen die Lichter im Wasser wie falsche Versprechen. Dein Kontakt bietet dir die alte Abkürzung an. Du spürst den Druck, aber du gehst nicht automatisch mit.',
      choices: [
        { label: 'Den Weg zu Ende gehen', detail: 'Weniger Glanz, mehr Kontrolle.', cash: -1800, nerve: 10, fame: 1, edge: 5, note: 'Du lässt den Moment vorbeiziehen. Morgen gehört wieder dir.' },
        { label: 'Den Druck in Arbeit drehen', detail: 'Ertrag gegen Anspannung.', cash: 800, nerve: -6, fame: 4, edge: 3, note: 'Du nutzt die Unruhe, ohne ihr den Schlüssel zu geben.' },
      ],
    }
  }
  if (turn === 7 && state?.smoker) {
    return {
      turn,
      act: 'AKTE II / RAUCH ÜBER DEM HAFEN',
      title: 'Eine Pause, die etwas zurückfordert.',
      text: 'Der Kontakt auf dem Parkplatz weiß, wann du aufstehen und rausgehen würdest. Seine Information ist gut. Sein Timing ist besser.',
      choices: [
        { label: 'Information kaufen', detail: 'Schneller Vorteil, neuer Druck.', cash: -2800, nerve: -5, fame: 4, edge: 8, note: 'Die Nachricht passt. Der Preis war nicht nur Geld.' },
        { label: 'Die Pause beenden', detail: 'Du gehst, bevor jemand deinen Takt besitzt.', cash: 100, nerve: 5, fame: -1, edge: 4, note: 'Du bleibst bei deinem eigenen Rhythmus.' },
      ],
    }
  }
  if (turn === 4 && PRESET_FIRST_ACTS[state?.storyId]) {
    const scene = PRESET_FIRST_ACTS[state.storyId]
    return {
      ...scene,
      turn,
      choices: [
        { label: 'Den Kontakt annehmen', detail: 'Ein kleiner Schritt nach draußen, ohne dich zu verlieren.', cash: 0, nerve: 6, fame: 2, edge: 3, routine: 1, connections: 2, note: 'Du lässt einen Kontakt zu. Nicht als Schuld, sondern als Möglichkeit.' },
        { label: 'Ein eigenes Signal senden', detail: 'Du bleibst auf Abstand, machst dich aber sichtbar.', cash: 120, nerve: -2, fame: 4, edge: 3, routine: 0, connections: 1, note: 'Du setzt deine eigene Grenze und hinterlässt trotzdem einen klaren Eindruck.' },
      ],
    }
  }
  return STORY_EVENTS.find((event) => event.turn === turn) ?? null
}

function storyArcFor(game) {
  if (game.chapter === 'krise') {
    return { id: 'care', label: 'NEBENKAPITEL / RÜCKKEHR', title: 'Der Run hält an, nicht auf.', text: 'Du sicherst Versorgung und einen nächsten Schritt. Das ist keine Niederlage und kein Ende der Geschichte.' }
  }
  if (game.chapter === 'konsequenz') {
    return { id: 'consequence', label: 'NEBENKAPITEL / FOLGEN', title: 'Die Stadt bleibt erreichbar.', text: 'Folgen bekommen einen Ort, Aufgaben und eine Rückkehr. Der Spielstand wird nicht weggenommen.' }
  }
  if (game.fame >= TARGET_FAME || game.turn >= 20) return STORY_ARCS[4]
  if (game.turn >= 14) return STORY_ARCS[3]
  if (game.turn >= 8) {
    const arc = STORY_ARCS[2]
    const routeText = {
      transparent: 'Du hast die kleine Schrift sichtbar gemacht. Jetzt muss Klarheit+ auf Menschen reagieren, die mitlesen.',
      build: 'Dein Gegenentwurf aus dem HQ1 ist klein, aber er zeigt: Einfach darf auch freiwillig heißen.',
      shortcut: 'Du kennst die Abkürzung jetzt. Ob sie dir dient oder dich lenkt, bleibt eine offene Entscheidung.',
    }[game.clarityRoute]
    return routeText ? { ...arc, text: routeText } : arc
  }
  if (game.turn >= 4) return STORY_ARCS[1]
  return STORY_ARCS[0]
}

function messagesForGame(game) {
  const messages = []
  if (game.newInTown && game.turn <= 3) {
    messages.push({ icon: '⌘', from: 'Joi / Park', meta: 'gerade eben', text: 'Kein Stress mit Antworten. Wenn du Luft hast: Wir sind nachher am Wasser. Bring nur dich mit.' })
  }
  if (game.turn >= 4) {
    messages.push({ icon: '▣', from: 'Mara / Kiosk', meta: 'Stadtfunk', text: 'Die neue Amt-App hat mich gefragt, ob ich „spontane Gespräche“ freigeben möchte. Ich habe „nur bei gutem Wetter“ angekreuzt.' })
  }
  if (game.clarityRoute === 'transparent') {
    messages.push({ icon: '§', from: 'Unbekannt / Klarheit+', meta: 'automatische Antwort', text: 'Danke für Ihren Hinweis. Ihre Lesbarkeit wurde zur weiteren Vereinfachung vorgemerkt.' })
  }
  if (game.clarityRoute === 'build') {
    messages.push({ icon: '✦', from: 'Noa / HQ1', meta: 'heute', text: 'Dein Gegenentwurf hängt am Whiteboard. Jemand hat „freiwillig“ dreimal unterstrichen. Gute Spur.' })
  }
  if (game.clarityRoute === 'shortcut') {
    messages.push({ icon: '◈', from: 'Klarheit+ Hinweis', meta: 'System', text: 'Wir haben Ihren Weg optimiert. Falls Sie ihn vermissen: Er ist in den Einstellungen unter „Komfort“ abgelegt.' })
  }
  if (game.faction === 'signal') {
    messages.push({ icon: '✦', from: 'Signalwerk / HQ1', meta: `Rang ${game.factionRank}`, text: 'Der nächste Entwurf braucht keinen Pitch-Glanz. Er muss nur für echte Leute funktionieren.' })
  }
  if (game.faction === 'neon') {
    messages.push({ icon: '≈', from: 'Neonhafen-Kollektiv', meta: `Rang ${game.factionRank}`, text: 'Heute Nacht ist schnell. Du musst nicht jede Tür nehmen, nur weil sie offen steht.' })
  }
  if (game.faction === 'parkkreis') {
    messages.push({ icon: '⌘', from: 'Parkkreis', meta: `Rang ${game.factionRank}`, text: 'Wir haben den Platz frei gehalten. Komm vorbei, wenn du willst — nicht weil du musst.' })
  }
  if (game.turn >= 14) {
    messages.push({ icon: '⌚', from: 'Strammburg-Uhr', meta: 'Tageslage', text: 'Die Stadt misst heute alles. Außer dem Moment, in dem jemand sagt: „Ich helfe dir.“' })
  }
  return messages.slice(0, 3)
}

function makeGame(origin, name, market) {
  return {
    status: 'playing',
    profileVersion: PROFILE_VERSION,
    name: name.trim() || 'Unbekannt',
    location: WORLD.origin,
    district: WORLD.originDistrict,
    city: WORLD.city,
    origin: origin.id,
    turn: 1,
    timeSpent: 0,
    cash: origin.cash,
    nerve: origin.nerve,
    hunger: 72,
    thirst: 68,
    fame: origin.fame,
    edge: origin.edge,
    peak: origin.cash + 2100,
    baseAssets: 2100,
    savings: 0,
    protectedFunds: 2100,
    debt: 0,
    insolvencyActive: true,
    insolvencyStarted: INSOLVENCY_STARTED,
    insolvencyPlan: false,
    fixedCosts: 0,
    foodVouchers: 0,
    foodOrderTurn: 0,
    onlineBanking: false,
    guardianActive: true,
    guardianApproval: false,
    smoker: false,
    smokingConfigured: false,
    cigarettes: 0,
    craving: 0,
    quittingSmoking: false,
    cleanTurns: 0,
    routine: 0,
    connections: 0,
    anchorTurn: -1,
    place: 'home',
    chapter: 'frei',
    lastMoveTurn: -1,
    placeActionTurn: -1,
    networkAccess: false,
    custodyUnlocked: false,
    routes: { creator: 0, risk: 0, social: 0 },
    faction: null,
    factionRank: 0,
    factionJobs: 0,
    factionJobTurn: -1,
    declinedFactions: [],
    market: market.map((asset) => ({ ...asset })),
    portfolio: Object.fromEntries(MARKETS.map((asset) => [asset.id, 0])),
    event: null,
    history: [{ turn: 0, label: 'Start', cash: origin.cash, note: `${origin.label}: ${origin.detail}` }],
  }
}

function makeFirstFlatGame(market) {
  const origin = { id: 'first-flat', label: 'Erster Auszug', detail: '18, eigene kleine Wohnung. Die Stadt ist groß, aber die Ideen sind größer.', cash: 0, nerve: 70, fame: 4, edge: 5 }
  return {
    ...makeGame(origin, '18 / NEUSTART', market),
    scenario: 'first-flat',
    baseAssets: 0,
    savings: 0,
    protectedFunds: 0,
    fixedCosts: 720,
    debt: 0,
    insolvencyActive: false,
    insolvencyStarted: null,
    guardianActive: false,
    guardianApproval: false,
    onlineBanking: true,
    peak: 0,
    history: [{ turn: 0, label: 'Erster Auszug', cash: 0, note: '18 Jahre alt, 0 € bar und eine kleine eigene Wohnung. Miete, Ideen und eine Stadt voller Möglichkeiten warten.' }],
  }
}

function makeCharacterGame(origin, name, market, age, housing, form, preset, animal) {
  const game = makeGame(origin, name, market)
  const avatarLabel = form.id === 'animal' && animal ? `Tier · ${animal.label}` : form.label
  return {
    ...game,
    location: game.location || WORLD.origin,
    district: game.district || WORLD.originDistrict,
    city: game.city || WORLD.city,
    scenario: 'custom-life',
    age: clamp(Number(age) || 18, 16, 99),
    avatarType: form.id,
    avatarLabel,
    avatarSpecies: form.id === 'animal' ? animal?.id || 'dog' : null,
    storyId: preset?.id || 'custom',
    housing: housing.id,
    housingLabel: housing.label,
    cash: 0,
    savings: 0,
    protectedFunds: 0,
    baseAssets: 0,
    fixedCosts: housing.fixedCosts,
    debt: 0,
    insolvencyActive: false,
    insolvencyStarted: null,
    guardianActive: false,
    guardianApproval: false,
    onlineBanking: true,
    peak: 0,
    newInTown: true,
    event: arrivalEventFor(form, preset, animal),
    history: [{ turn: 0, label: 'Ankunft in Strammburg', cash: 0, note: `${avatarLabel} / ${housing.label}: ${housing.detail} Neu in der Stadt beginnt Sicherheit mit einer kleinen, selbst gewählten Routine.` }],
  }
}

function normalizeGame(game) {
  const savings = Number.isFinite(game.savings) ? game.savings : (Number(game.baseAssets) || 0)
  const protectedFunds = Number.isFinite(game.protectedFunds) ? game.protectedFunds : 0
  const debt = Number.isFinite(game.debt) ? game.debt : 0
  const savedMarket = Array.isArray(game.market) ? game.market : []
  const market = MARKETS.map((asset) => {
    const saved = savedMarket.find((item) => item.id === asset.id) || {}
    return { ...asset, ...saved, unit: asset.unit, volatility: asset.volatility, change: Number(saved.change) || 0 }
  })
  const portfolio = Object.fromEntries(MARKETS.map((asset) => [asset.id, Number(game.portfolio?.[asset.id]) || 0]))
  return {
    ...game,
    profileVersion: Number.isFinite(game.profileVersion) ? game.profileVersion : 1,
    savings,
    protectedFunds,
    baseAssets: savings + protectedFunds,
    debt,
    market,
    portfolio,
    insolvencyActive: typeof game.insolvencyActive === 'boolean' ? game.insolvencyActive : true,
    insolvencyStarted: game.insolvencyStarted || INSOLVENCY_STARTED,
    insolvencyPlan: typeof game.insolvencyPlan === 'boolean' ? game.insolvencyPlan : false,
    timeSpent: Number.isFinite(game.timeSpent) ? game.timeSpent : 0,
    fixedCosts: Number.isFinite(game.fixedCosts) ? game.fixedCosts : 0,
    foodVouchers: Number.isFinite(game.foodVouchers) ? game.foodVouchers : 0,
    foodOrderTurn: Number.isFinite(game.foodOrderTurn) ? game.foodOrderTurn : 0,
    hunger: Number.isFinite(game.hunger) ? game.hunger : 72,
    thirst: Number.isFinite(game.thirst) ? game.thirst : 68,
    onlineBanking: typeof game.onlineBanking === 'boolean' ? game.onlineBanking : false,
    guardianActive: typeof game.guardianActive === 'boolean' ? game.guardianActive : true,
    guardianApproval: typeof game.guardianApproval === 'boolean' ? game.guardianApproval : false,
    smoker: typeof game.smoker === 'boolean' ? game.smoker : false,
    smokingConfigured: typeof game.smokingConfigured === 'boolean' ? game.smokingConfigured : false,
    cigarettes: Number.isFinite(game.cigarettes) ? game.cigarettes : 0,
    craving: Number.isFinite(game.craving) ? game.craving : 0,
    quittingSmoking: typeof game.quittingSmoking === 'boolean' ? game.quittingSmoking : false,
    cleanTurns: Number.isFinite(game.cleanTurns) ? game.cleanTurns : 0,
    routine: clamp(Number(game.routine) || 0, 0, 6),
    connections: clamp(Number(game.connections) || 0, 0, 12),
    newInTown: typeof game.newInTown === 'boolean' ? game.newInTown : false,
    anchorTurn: Number.isFinite(game.anchorTurn) ? game.anchorTurn : -1,
    place: PLAY_SPACES.some((space) => space.id === game.place) ? game.place : 'home',
    chapter: typeof game.chapter === 'string' ? game.chapter : 'frei',
    lastMoveTurn: Number.isFinite(game.lastMoveTurn) ? game.lastMoveTurn : -1,
    placeActionTurn: Number.isFinite(game.placeActionTurn) ? game.placeActionTurn : -1,
    networkAccess: typeof game.networkAccess === 'boolean' ? game.networkAccess : false,
    custodyUnlocked: typeof game.custodyUnlocked === 'boolean' ? game.custodyUnlocked : false,
    routes: { creator: Number(game.routes?.creator) || 0, risk: Number(game.routes?.risk) || 0, social: Number(game.routes?.social) || 0 },
    faction: FACTIONS.some((faction) => faction.id === game.faction) ? game.faction : null,
    factionRank: clamp(Number(game.factionRank) || 0, 0, 9),
    factionJobs: Math.max(0, Number(game.factionJobs) || 0),
    factionJobTurn: Number.isFinite(game.factionJobTurn) ? game.factionJobTurn : -1,
    declinedFactions: Array.isArray(game.declinedFactions) ? game.declinedFactions.filter((id) => FACTIONS.some((faction) => faction.id === id)) : [],
    status: 'playing',
    avatarType: CHARACTER_FORMS.some((form) => form.id === game.avatarType) ? game.avatarType : 'human',
    avatarLabel: game.avatarType === 'animal'
      ? `Tier · ${ANIMAL_FORMS.find((animal) => animal.id === game.avatarSpecies)?.label || 'Hund'}`
      : CHARACTER_FORMS.find((form) => form.id === game.avatarType)?.label || 'Mensch',
    avatarSpecies: game.avatarType === 'animal' && ANIMAL_FORMS.some((animal) => animal.id === game.avatarSpecies) ? game.avatarSpecies : null,
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(value)
}

function worldDayIndex(date) {
  const utcDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor((utcDay - WORLD_EPOCH) / 86400000)
}

function formatWorldClock(date) {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

function portfolioValue(game) {
  return game.market.reduce((total, asset) => total + asset.price * game.portfolio[asset.id], 0)
}

function netWorth(game) {
  return game.cash + game.baseAssets + portfolioValue(game) - (game.debt || 0)
}

function insolvencyPayment(game, gain) {
  if (!game.insolvencyActive || game.debt <= 0 || gain <= 0) return 0
  const rate = game.insolvencyPlan ? 0.1 : INSOLVENCY_RATE
  return Math.min(game.debt, Math.round(gain * rate))
}

function keySuggestionFor(game) {
  if (game.cash <= 0 && game.foodVouchers < 10) return { id: 'idea', label: 'IDEEN-PITCH STARTEN', title: 'Erste Einnahme finden', text: 'Mit 0 € ist dein nächster Schlüssel kein Risiko: mach aus einer Idee einen ersten Auftrag.', time: '1 Woche' }
  if (game.foodOrderTurn !== game.turn && (game.cash >= 10 || game.foodVouchers >= 10)) return { id: 'food', label: 'ESSENSKORB SICHERN', title: 'Versorgung zuerst', text: 'Der Essenskorb hält Hunger und Stress aus deinem nächsten Zug. Ohne ihn folgt ein Rückkehrkapitel, kein Ende.', time: 'kurzer Schritt' }
  if (game.insolvencyActive && game.debt > 0 && !game.insolvencyPlan) return { id: 'administrator', label: 'VERWALTERIN ANRUFEN', title: 'Zahlungsplan klären', text: 'Ein Gespräch macht die Rate planbarer. Es löst nicht alles, aber nimmt Chaos aus dem System.', time: 'kurzer Schritt' }
  if (game.turn > 3 && game.guardianActive && !game.guardianApproval) return { id: 'guardian', label: 'BETREUER ANRUFEN', title: 'Online-Freigabe holen', text: 'Du entscheidest über den Weg; der Betreuer erledigt die Online-Abwicklung.', time: 'kurzer Schritt' }
  return { id: 'choice', label: 'DEINEN WEG WÄHLEN', title: 'Keine Pflicht offen', text: 'Die Basis steht. Jetzt entscheidest du, ob du sicher aufbaust oder etwas riskierst.', time: '1 Woche' }
}

function factionOfferFor(game) {
  if (game.faction) return null
  const skipped = game.declinedFactions || []
  return FACTIONS.filter((faction) => !skipped.includes(faction.id)).find((faction) => {
    if (faction.id === 'parkkreis') return (game.connections || 0) >= 2
    return (game.routes?.[faction.route] || 0) >= 1
  }) || null
}

function arePlacesConnected(from, to) {
  return MAP_LINKS.some(([a, b]) => (a === from && b === to) || (a === to && b === from))
}

function reprice(market) {
  return market.map((asset) => {
    const change = (Math.random() - 0.5) * asset.volatility * 100
    return {
      ...asset,
      change,
      price: Math.max(1, Math.round(asset.price * (1 + change / 100))),
    }
  })
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value))
}

function needsAfterTurn(game) {
  const hunger = clamp(game.hunger - 9, 0, 100)
  const thirst = clamp(game.thirst - 11, 0, 100)
  const tobacco = ADDICTION_RULES.tobacco
  const cleanTurns = game.quittingSmoking ? game.cleanTurns + 1 : 0
  const quittingSmoking = game.quittingSmoking && cleanTurns < tobacco.cleanTurns
  const cravingShift = tobacco.withdrawalShift[Math.min(Math.max(cleanTurns - 1, 0), tobacco.withdrawalShift.length - 1)]
  const craving = !game.smoker ? 0 : game.quittingSmoking ? clamp(game.craving + cravingShift, 0, 100) : clamp(game.craving + tobacco.activeCraving, 0, 100)
  const withdrawalPenalty = game.quittingSmoking ? tobacco.withdrawalPenalty[Math.min(Math.max(cleanTurns - 1, 0), tobacco.withdrawalPenalty.length - 1)] : craving >= 70 ? 5 : 0
  const rawNervePenalty = (hunger < 20 ? 6 : 0) + (thirst < 20 ? 8 : 0) + withdrawalPenalty
  const nervePenalty = Math.max(0, rawNervePenalty - Math.floor((game.routine || 0) / 2))
  return { hunger, thirst, craving, nervePenalty, quittingSmoking, cleanTurns, quitComplete: game.quittingSmoking && cleanTurns >= tobacco.cleanTurns }
}

function Stat({ label, value, hint, alert, icon, description }) {
  return (
    <div className={`stat ${alert ? 'stat-alert' : ''}`} title={description}>
      <span className="stat-label"><i>{icon}</i>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  )
}

function MadeInHamburg() {
  return <footer className="made-in">MADE IN STRAMMBURG <span>◆</span> EYTONLAND SIGNAL</footer>
}

function App() {
  const [screen, setScreen] = useState('start')
  const [name, setName] = useState('')
  const [age, setAge] = useState('18')
  const [housingId, setHousingId] = useState('first-flat')
  const [avatarType, setAvatarType] = useState('human')
  const [animalId, setAnimalId] = useState('dog')
  const [presetId, setPresetId] = useState(null)
  const [saveSlot, setSaveSlot] = useState('first-flat')
  const [originId, setOriginId] = useState(ORIGINS[0].id)
  const [game, setGame] = useState(null)
  const [liveMarket, setLiveMarket] = useState(() => MARKETS.map((asset) => ({ ...asset, change: 0 })))
  const [marketStatus, setMarketStatus] = useState('loading')
  const [ledgerOpen, setLedgerOpen] = useState(false)
  const [ledgerDraft, setLedgerDraft] = useState({ cash: '', savings: '', protectedFunds: '', debt: '', fixedCosts: '', onlineBanking: false, smoker: false })
  const [spilo, setSpilo] = useState(null)
  const [cinemaSceneId, setCinemaSceneId] = useState('home')
  const [cinemaCameraId, setCinemaCameraId] = useState('street')
  const [cinemaReturnScreen, setCinemaReturnScreen] = useState('start')
  const [cinemaLook, setCinemaLook] = useState({ yaw: 0, pitch: 0 })
  const [jumpMeter, setJumpMeter] = useState(0)
  const [worldNow, setWorldNow] = useState(() => new Date())
  const activeSaveKey = saveSlot === 'personal' ? PERSONAL_SAVE_KEY : FIRST_FLAT_SAVE_KEY

  useEffect(() => {
    try {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
      if (!localStorage.getItem(PERSONAL_SAVE_KEY) && legacy) localStorage.setItem(PERSONAL_SAVE_KEY, legacy)
      const saved = JSON.parse(localStorage.getItem(FIRST_FLAT_SAVE_KEY))
      if (saved?.game && saved.status === 'playing') {
        setGame(normalizeGame(saved.game))
        setScreen('game')
      }
    } catch {
      localStorage.removeItem(FIRST_FLAT_SAVE_KEY)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function loadMarket() {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,solana&vs_currencies=eur&include_24hr_change=true', { signal: controller.signal })
        if (!response.ok) throw new Error('Kursdienst nicht erreichbar')
        const data = await response.json()
        const hasAllPrices = MARKETS.filter((asset) => !asset.fictional).every((asset) => Number.isFinite(data[asset.apiId]?.eur))
        if (!hasAllPrices) throw new Error('Unvollständige Kursdaten')
        setLiveMarket(MARKETS.map((asset) => ({
          ...asset,
          price: asset.fictional ? asset.price : Math.round(data[asset.apiId].eur),
          change: asset.fictional ? 0 : Number(data[asset.apiId].eur_24h_change) || 0,
        })))
        setMarketStatus('live')
      } catch (error) {
        if (error.name !== 'AbortError') setMarketStatus('fallback')
      }
    }
    loadMarket()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (game?.status === 'playing') {
      localStorage.setItem(activeSaveKey, JSON.stringify({ status: 'playing', game }))
    }
  }, [activeSaveKey, game])

  useEffect(() => {
    if (game && (game.savings === undefined || game.protectedFunds === undefined || game.foodVouchers === undefined || game.foodOrderTurn === undefined || game.onlineBanking === undefined || game.guardianApproval === undefined || game.debt === undefined || game.timeSpent === undefined || game.smokingConfigured === undefined || game.quittingSmoking === undefined)) {
      setGame(normalizeGame(game))
    }
  }, [game])

  useEffect(() => {
    if (!game || game.profileVersion === PROFILE_VERSION) return
    setGame({
      ...normalizeGame(game),
      profileVersion: PROFILE_VERSION,
      cash: 0,
      savings: 0,
      protectedFunds: 2100,
      baseAssets: 2100,
      fixedCosts: 0,
      foodVouchers: 0,
      foodOrderTurn: 0,
      onlineBanking: false,
      guardianActive: true,
      guardianApproval: false,
      timeSpent: 0,
      peak: 2100,
      history: [{ turn: 0, label: 'Schwieriger Start', cash: 0, note: '0 € verfügbar. Rund 2.100 € liegen geschützt im Schutzkonto. Du entscheidest frei, aber jeder Weg kostet Zeit.' }],
    })
  }, [game])

  useEffect(() => {
    if (screen !== 'spilo') return undefined
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const phase = ((Date.now() - startedAt) % 1600) / 1600
      setJumpMeter(Math.round(phase <= 0.5 ? phase * 200 : (1 - phase) * 200))
    }, 32)
    return () => window.clearInterval(timer)
  }, [screen])

  useEffect(() => {
    const timer = window.setInterval(() => setWorldNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const origin = useMemo(() => ORIGINS.find((item) => item.id === originId), [originId])
  const housing = useMemo(() => HOUSING.find((item) => item.id === housingId), [housingId])
  const currentLog = game?.history.at(-1)
  const goalProgress = game ? clamp((netWorth(game) / TARGET_CASH) * 100, 0, 100) : 0
  const marketReady = game?.turn > 3
  const marketOpen = marketReady && (game?.onlineBanking || game?.guardianApproval)
  const availableActions = marketReady ? ACTIONS : LEDGER_ACTIONS
  const keySuggestion = game ? keySuggestionFor(game) : null
  const faction = game ? FACTIONS.find((item) => item.id === game.faction) : null
  const factionOffer = game ? factionOfferFor(game) : null
  const cityBulletin = game ? CITY_BULLETINS[Math.abs(worldDayIndex(worldNow)) % CITY_BULLETINS.length] : null
  const storyArc = game ? storyArcFor(game) : null
  const messages = game ? messagesForGame(game) : []

  function openCinema(sceneId = 'home') {
    const sceneExists = CINEMA_SCENES.some((scene) => scene.id === sceneId)
    setCinemaSceneId(sceneExists ? sceneId : 'home')
    setCinemaCameraId('street')
    setCinemaLook({ yaw: 0, pitch: 0 })
    setCinemaReturnScreen(screen)
    setScreen('cinema')
  }

  function setCinemaScene(sceneId) {
    setCinemaSceneId(sceneId)
    setCinemaLook({ yaw: 0, pitch: 0 })
  }

  function steerCinema(event) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    setCinemaLook({ yaw: Math.round(x * -10), pitch: Math.round(y * 7) })
  }

  function startGame() {
    const cleanName = name.trim().replace(/[^a-zA-ZäöüÄÖÜß0-9 -]/g, '').slice(0, 16)
    const form = CHARACTER_FORMS.find((item) => item.id === avatarType) || CHARACTER_FORMS[0]
    const animal = ANIMAL_FORMS.find((item) => item.id === animalId) || ANIMAL_FORMS[0]
    const preset = CHARACTER_PRESETS.find((item) => item.id === presetId)
    const character = makeCharacterGame(origin, cleanName, liveMarket, age, housing, form, preset, animal)
    setSaveSlot('first-flat')
    setGame(character)
    setLedgerDraft({ cash: '0', savings: '0', protectedFunds: '0', debt: '0', fixedCosts: String(housing.fixedCosts), onlineBanking: true, smoker: false })
    setLedgerOpen(true)
    setScreen('game')
  }

  function applyCharacterPreset(preset) {
    setPresetId(preset.id)
    setName(preset.name)
    setAge(String(preset.age))
    setAvatarType(preset.avatarType)
    setHousingId(preset.housingId)
    setOriginId(preset.originId)
  }

  function startSpilo() {
    if (!game || game.status !== 'playing' || game.cash < 10) return
    setSpilo({ stake: 10 })
    setJumpMeter(0)
    setScreen('spilo')
  }

  function resolveSpilo() {
    if (!game || !spilo) return
    const distance = Math.abs(jumpMeter - 78)
    const payout = distance <= 5 ? spilo.stake * 5 : distance <= 16 ? spilo.stake * 2 : distance <= 27 ? spilo.stake : 0
    const net = payout - spilo.stake
    const debtPayment = insolvencyPayment(game, Math.max(net, 0))
    const nextDebt = game.debt - debtPayment
    const needs = needsAfterTurn(game)
    const nextCash = game.cash + net - debtPayment
    const nextNerve = clamp(game.nerve + (payout >= 100 ? 7 : -9) - needs.nervePenalty, 0, 100)
    const nextTurn = game.turn + 1
    const repricedMarket = reprice(game.market)
    const provisionalGame = { ...game, cash: nextCash, debt: nextDebt, market: repricedMarket }
    let status = 'playing'
    let note = payout === spilo.stake * 5 ? `Perfekter Sprung. Das Neon kippt auf deine Seite: ${formatMoney(payout)} € Auszahlung.` : payout === spilo.stake * 2 ? `Du triffst das Fenster: ${formatMoney(payout)} € Auszahlung.` : payout === spilo.stake ? `Gerade noch gehalten: deine ${formatMoney(spilo.stake)} € kommen zurück.` : `Du landest neben dem Fenster. Die ${formatMoney(spilo.stake)} € sind weg.`
    if (debtPayment > 0) note += ` Zahlungsplan: −${formatMoney(debtPayment)} € Schulden.`

    if (game.foodOrderTurn !== game.turn) {
      note += ` Die Woche ohne Essenskorb wird zum Krisenkapitel. Der Run läuft weiter, aber Versorgung hat jetzt Vorrang.`
    } else if (needs.hunger <= 0) {
      note = 'Du hast zu lange keine Nahrung beschafft. Das Krisenkapitel beginnt – der Run läuft weiter.'
    } else if (needs.thirst <= 0) {
      note = 'Du hast zu lange nichts getrunken. Das Krisenkapitel beginnt – der Run läuft weiter.'
    } else if (!game.quittingSmoking && needs.craving >= 100) {
      note = 'Der Entzug übernimmt. Du brauchst ein Krisenkapitel und Unterstützung, aber der Run läuft weiter.'
    } else if (provisionalGame.cash <= -10000 || nextNerve <= 0) {
      note = 'Der Sprung war zu viel. Die Welt wird enger, aber der Run ist nicht vorbei.'
    } else if (nextTurn === FIRST_MILESTONE_TURN + 1) {
      note += ` Erster Meilenstein erreicht: ${formatMoney(TARGET_CASH)} € und ${TARGET_FAME} Renommee sind kein Ende, sondern dein nächstes Kapitel.`
    }

    const nextGame = {
      ...game,
      status,
      turn: nextTurn,
      timeSpent: game.timeSpent + 1,
      cash: nextCash,
      debt: nextDebt,
      insolvencyActive: nextDebt > 0,
      nerve: nextNerve,
      hunger: needs.hunger,
      thirst: needs.thirst,
      craving: needs.quitComplete ? 0 : needs.craving,
      smoker: needs.quitComplete ? false : game.smoker,
      smokingConfigured: needs.quitComplete ? false : game.smokingConfigured,
      cigarettes: needs.quitComplete ? 0 : game.cigarettes,
      quittingSmoking: needs.quitComplete ? false : needs.quittingSmoking,
      cleanTurns: needs.quitComplete ? 0 : needs.cleanTurns,
      market: repricedMarket,
      event: status === 'playing' ? storyEventForTurn(nextTurn, { ...game, smoker: needs.quitComplete ? false : game.smoker, quittingSmoking: needs.quittingSmoking }) : null,
      peak: Math.max(game.peak, netWorth(provisionalGame)),
      history: [...game.history, { turn: game.turn, label: 'Spilo-Sprung', cash: net - debtPayment, note }],
    }
    setGame(nextGame)
    setSpilo(null)
    setScreen('game')
  }

  function callGuardian() {
    if (!game?.guardianActive || game.guardianApproval) return
    setGame({
      ...game,
      guardianApproval: true,
      timeSpent: game.timeSpent + 1,
      history: [...game.history, { turn: game.turn, label: 'Betreuer angerufen', cash: 0, note: 'Der Betreuer bestätigt die Online-Freigabe. Der Zugang läuft über ihn, nicht direkt über dich.' }],
    })
  }

  function callInsolvencyAdministrator() {
    if (!game?.insolvencyActive || game.insolvencyPlan) return
    setGame({
      ...game,
      insolvencyPlan: true,
      timeSpent: game.timeSpent + 1,
      history: [...game.history, { turn: game.turn, label: 'Insolvenzverwalterin gesprochen', cash: 0, note: 'Ihr legt einen klaren Plan fest. Im Spiel sinkt die automatische Rate von 15 % auf 10 % positiver Einnahmen.' }],
    })
  }

  function followKeySuggestion() {
    if (!game || !keySuggestion) return
    if (keySuggestion.id === 'idea') resolveAction(LEDGER_ACTIONS.find((action) => action.id === 'idea'))
    if (keySuggestion.id === 'food') buyGroceries('Supermarkt')
    if (keySuggestion.id === 'guardian') callGuardian()
    if (keySuggestion.id === 'administrator') callInsolvencyAdministrator()
  }

  function resolveAction(action) {
    if (!game || game.status !== 'playing') return
    if (action.minimumCash && game.cash < action.minimumCash) return
    const emergencyStart = ['income', 'idea'].includes(action.id) && game.turn === 1 && game.cash === 0
    if (!emergencyStart && !requireFoodOrder()) return

    const outcome = action.resolve(game, Math.random())
    const nextRoutes = action.route ? { ...game.routes, [action.route]: (game.routes?.[action.route] || 0) + 1 } : game.routes
    const upkeep = game.turn % 3 === 0 ? game.fixedCosts : 0
    const debtPayment = insolvencyPayment(game, outcome.cash)
    const nextDebt = game.debt - debtPayment
    const nextCash = game.cash + outcome.cash - upkeep - debtPayment
    const needs = needsAfterTurn(game)
    const nextNerve = clamp(game.nerve + outcome.nerve - needs.nervePenalty, 0, 100)
    const nextFame = clamp(game.fame + outcome.fame, 0, 100)
    const nextEdge = clamp(game.edge + outcome.edge, 0, 30)
    const nextTurn = game.turn + 1
    let status = 'playing'
    let note = outcome.note

    if (upkeep > 0) note += ` Fixkosten: −${formatMoney(upkeep)} €.`
    if (debtPayment > 0) note += ` Zahlungsplan: −${formatMoney(debtPayment)} € Schulden.`
    if (emergencyStart) note += ' Notfallstart: Du sicherst erst die erste Einnahme, dann die Versorgung.'
    if (needs.nervePenalty > 0) note += ` Hunger, Durst oder Entzug belasten dich: −${needs.nervePenalty} Nerven.`
    if (needs.quitComplete) note += ' Sechs clean gebliebene Zyklen: der Tabakentzug ist geschafft.'
    if (nextTurn === 4) note += ' Das Haushaltsbuch sitzt. Der Markt ist jetzt offen.'
    const repricedMarket = reprice(game.market)
    const provisionalGame = { ...game, cash: nextCash, debt: nextDebt, market: repricedMarket }
    if (needs.hunger <= 0) {
      note = 'Du hast zu lange keine Nahrung beschafft. Das Krisenkapitel beginnt – der Run läuft weiter.'
    } else if (needs.thirst <= 0) {
      note = 'Du hast zu lange nichts getrunken. Das Krisenkapitel beginnt – der Run läuft weiter.'
    } else if (!game.quittingSmoking && needs.craving >= 100) {
      note = 'Der Entzug übernimmt. Unterstützung und Ruhe werden wichtig, aber der Run läuft weiter.'
    } else if (provisionalGame.cash <= -10000) {
      note = 'Die Liquidität ist weg. Das Kapitel wird härter, aber der Run ist nicht vorbei.'
    } else if (nextNerve <= 0) {
      note = 'Der Druck trifft vor dem nächsten Zug. Das Krisenkapitel beginnt, aber der Run geht weiter.'
    } else if (nextTurn === FIRST_MILESTONE_TURN + 1) {
      note += ` Erster Meilenstein: ${formatMoney(TARGET_CASH)} € und ${TARGET_FAME} Renommee sind erreicht oder bleiben offen. Der Run geht weiter.`
    }

    const nextGame = {
      ...game,
      status,
      turn: nextTurn,
      timeSpent: game.timeSpent + 1,
      cash: nextCash,
      debt: nextDebt,
      insolvencyActive: nextDebt > 0,
      nerve: nextNerve,
      hunger: needs.hunger,
      thirst: needs.thirst,
      craving: needs.quitComplete ? 0 : needs.craving,
      smoker: needs.quitComplete ? false : game.smoker,
      smokingConfigured: needs.quitComplete ? false : game.smokingConfigured,
      cigarettes: needs.quitComplete ? 0 : game.cigarettes,
      quittingSmoking: needs.quitComplete ? false : needs.quittingSmoking,
      cleanTurns: needs.quitComplete ? 0 : needs.cleanTurns,
      routes: nextRoutes,
      fame: nextFame,
      edge: nextEdge,
      peak: Math.max(game.peak, netWorth(provisionalGame)),
      market: repricedMarket,
      event: status === 'playing' ? storyEventForTurn(nextTurn, { ...game, smoker: needs.quitComplete ? false : game.smoker, quittingSmoking: needs.quittingSmoking }) : null,
      history: [...game.history, {
        turn: game.turn,
        label: action.label,
        cash: outcome.cash - upkeep - debtPayment,
        note,
      }],
    }
    setGame(nextGame)
  }

  function tradeAsset(asset, direction) {
    if (!game || game.status !== 'playing' || game.turn <= 3 || !(game.onlineBanking || game.guardianApproval)) return
    if (!requireFoodOrder()) return
    const units = asset.unit
    const value = Math.round(asset.price * units)
    const held = game.portfolio[asset.id]
    const canBuy = game.cash >= value
    const canSell = held >= units - 0.0000001
    if ((direction === 'buy' && !canBuy) || (direction === 'sell' && !canSell)) return

    const isBuy = direction === 'buy'
    const upkeep = game.turn % 3 === 0 ? game.fixedCosts : 0
    const saleGain = isBuy ? 0 : value
    const debtPayment = insolvencyPayment(game, saleGain)
    const nextDebt = game.debt - debtPayment
    const nextCash = game.cash + (isBuy ? -value : value) - upkeep - debtPayment
    const nextPortfolio = { ...game.portfolio, [asset.id]: held + (isBuy ? units : -units) }
    const needs = needsAfterTurn(game)
    const nextNerve = clamp(game.nerve - 3 - needs.nervePenalty, 0, 100)
    const nextTurn = game.turn + 1
    const repricedMarket = reprice(game.market)
    const provisionalGame = { ...game, cash: nextCash, debt: nextDebt, market: repricedMarket, portfolio: nextPortfolio }
    let status = 'playing'
    let note = `${isBuy ? 'Kauf' : 'Verkauf'}: ${units} ${asset.id} für ${formatMoney(value)} €.`
    if (upkeep > 0) note += ` Fixkosten: −${formatMoney(upkeep)} €.`
    if (debtPayment > 0) note += ` Zahlungsplan: −${formatMoney(debtPayment)} € Schulden.`
    if (needs.nervePenalty > 0) note += ` Hunger, Durst oder Entzug belasten dich: −${needs.nervePenalty} Nerven.`
    if (needs.quitComplete) note += ' Sechs clean gebliebene Zyklen: der Tabakentzug ist geschafft.'
    if (needs.hunger <= 0) {
      note = 'Du hast zu lange keine Nahrung beschafft. Das Krisenkapitel beginnt – der Run läuft weiter.'
    } else if (needs.thirst <= 0) {
      note = 'Du hast zu lange nichts getrunken. Das Krisenkapitel beginnt – der Run läuft weiter.'
    } else if (!game.quittingSmoking && needs.craving >= 100) {
      note = 'Der Entzug übernimmt. Unterstützung und Ruhe werden wichtig, aber der Run läuft weiter.'
    } else if (provisionalGame.cash <= -10000 || nextNerve <= 0) {
      note = 'Die Position bricht ein. Das Krisenkapitel beginnt, aber der Run geht weiter.'
    } else if (nextTurn === FIRST_MILESTONE_TURN + 1) {
      note += ` Erster Meilenstein: ${formatMoney(TARGET_CASH)} € und ${TARGET_FAME} Renommee sind kein Finale. Die Position läuft weiter.`
    }
    const nextGame = {
      ...game,
      status,
      turn: nextTurn,
      timeSpent: game.timeSpent + 1,
      cash: nextCash,
      debt: nextDebt,
      insolvencyActive: nextDebt > 0,
      nerve: nextNerve,
      hunger: needs.hunger,
      thirst: needs.thirst,
      craving: needs.quitComplete ? 0 : needs.craving,
      smoker: needs.quitComplete ? false : game.smoker,
      smokingConfigured: needs.quitComplete ? false : game.smokingConfigured,
      cigarettes: needs.quitComplete ? 0 : game.cigarettes,
      quittingSmoking: needs.quitComplete ? false : needs.quittingSmoking,
      cleanTurns: needs.quitComplete ? 0 : needs.cleanTurns,
      market: repricedMarket,
      portfolio: nextPortfolio,
      event: status === 'playing' ? storyEventForTurn(nextTurn, { ...game, smoker: needs.quitComplete ? false : game.smoker, quittingSmoking: needs.quittingSmoking }) : null,
      peak: Math.max(game.peak, netWorth(provisionalGame)),
      history: [...game.history, { turn: game.turn, label: `${isBuy ? 'Kauf' : 'Verkauf'} ${asset.id}`, cash: (isBuy ? -value : value) - debtPayment, note }],
    }
    setGame(nextGame)
  }

  function resolveStory(choice) {
    if (!game?.event) return
    const debtPayment = insolvencyPayment(game, choice.cash)
    const nextDebt = game.debt - debtPayment
    const nextCash = game.cash + choice.cash - debtPayment
    const nextNerve = clamp(game.nerve + choice.nerve, 0, 100)
    const nextFame = clamp(game.fame + choice.fame, 0, 100)
    const nextEdge = clamp(game.edge + choice.edge, 0, 30)
    const nextRoutine = clamp((game.routine || 0) + (choice.routine || 0), 0, 6)
    const nextConnections = clamp((game.connections || 0) + (choice.connections || 0), 0, 12)
    const provisionalGame = { ...game, cash: nextCash, debt: nextDebt }
    const status = 'playing'
    const nextGame = {
      ...game,
      status,
      cash: nextCash,
      timeSpent: game.timeSpent + 1,
      debt: nextDebt,
      insolvencyActive: nextDebt > 0,
      nerve: nextNerve,
      fame: nextFame,
      edge: nextEdge,
      routine: nextRoutine,
      connections: nextConnections,
      event: null,
      clarityRoute: choice.clarityRoute ?? game.clarityRoute,
      peak: Math.max(game.peak, netWorth(provisionalGame)),
      history: [...game.history, { turn: game.turn, label: choice.label, cash: choice.cash - debtPayment, note: debtPayment > 0 ? `${choice.note} Zahlungsplan: −${formatMoney(debtPayment)} € Schulden.` : choice.note }],
    }
    setGame(nextGame)
  }

  function requireFoodOrder() {
    if (!game || game.foodOrderTurn === game.turn) return true
    const nextGame = {
      ...game,
      status: 'playing',
      chapter: 'krise',
      place: 'care',
      nerve: Math.max(15, game.nerve - 12),
      hunger: Math.max(12, game.hunger - 18),
      foodVouchers: Math.max(10, game.foodVouchers),
      history: [...game.history, { turn: game.turn, label: 'Versorgungskrise', cash: 0, note: 'Der Essenskorb fehlt. Der Run endet nicht: Ein Notgutschein ist da, sichere jetzt Essen und geh dann weiter.' }],
    }
    setGame(nextGame)
    return false
  }

  function buyFoodVoucher(amount, channel = 'Supermarkt') {
    if (!game || game.cash < amount) return
    const nextGame = {
      ...game,
      cash: game.cash - amount,
      foodVouchers: game.foodVouchers + amount,
      timeSpent: game.timeSpent + 1,
      history: [...game.history, { turn: game.turn, label: 'Essensgutschein', cash: -amount, note: `Du lädst einen Essensgutschein über ${formatMoney(amount)} € via ${channel}. Er gilt für Essen und Getränke online oder im Supermarkt.` }],
    }
    setGame(nextGame)
  }

  function buyGroceries(channel = 'Supermarkt') {
    if (!game) return
    const basket = 10
    const voucherUsed = Math.min(game.foodVouchers, basket)
    const cashDue = basket - voucherUsed
    if (game.cash < cashDue) return
    const nerveGain = voucherUsed > 0 ? 8 : 2
    const nextGame = {
      ...game,
      cash: game.cash - cashDue,
      foodVouchers: game.foodVouchers - voucherUsed,
      timeSpent: game.timeSpent + 1,
      foodOrderTurn: game.turn,
      routine: clamp((game.routine || 0) + 1, 0, 6),
      nerve: clamp(game.nerve + nerveGain, 0, 100),
      hunger: clamp(game.hunger + 38, 0, 100),
      history: [...game.history, { turn: game.turn, label: `${channel}-Essen`, cash: -cashDue, note: voucherUsed > 0 ? `Essen via ${channel} mit ${formatMoney(voucherUsed)} € Gutschein bezahlt: Stress sinkt, +${nerveGain} Nerven und +38 Hunger.` : `Essen via ${channel} bar bezahlt: −${formatMoney(cashDue)} €, +${nerveGain} Nerven und +38 Hunger.` }],
    }
    setGame(nextGame)
  }

  function buyDrink(channel = 'Supermarkt') {
    if (!game) return
    const price = 3
    const voucherUsed = Math.min(game.foodVouchers, price)
    const cashDue = price - voucherUsed
    if (game.cash < cashDue) return
    setGame({
      ...game,
      cash: game.cash - cashDue,
      foodVouchers: game.foodVouchers - voucherUsed,
      timeSpent: game.timeSpent + 1,
      thirst: clamp(game.thirst + 44, 0, 100),
      nerve: clamp(game.nerve + 3, 0, 100),
      history: [...game.history, { turn: game.turn, label: `${channel}-Getränk`, cash: -cashDue, note: voucherUsed > 0 ? `Getränk via ${channel} mit Gutschein bezahlt: +44 Durst und +3 Nerven.` : `Getränk via ${channel} bar bezahlt: −${formatMoney(cashDue)} €, +44 Durst und +3 Nerven.` }],
    })
  }

  function buyTobacco(channel = 'Supermarkt') {
    if (!game) return
    const price = 8
    if (game.cash < price) return
    const startsSmoking = !game.smoker
    const relapse = game.quittingSmoking
    setGame({
      ...game,
      cash: game.cash - price,
      timeSpent: game.timeSpent + 1,
      smoker: true,
      smokingConfigured: true,
      cigarettes: game.cigarettes + 6,
      quittingSmoking: false,
      cleanTurns: 0,
      history: [...game.history, { turn: game.turn, label: startsSmoking ? 'Rauchen angefangen' : relapse ? 'Tabakentzug abgebrochen' : `${channel}-Tabak`, cash: -price, note: startsSmoking ? `Du fängst an zu rauchen: −${formatMoney(price)} €, +6 Zigaretten. Ab jetzt kann Entzug entstehen.` : relapse ? `Rückfall: −${formatMoney(price)} €, +6 Zigaretten. Der Clean-Zähler startet neu.` : `Tabak gekauft: −${formatMoney(price)} €, +6 Zigaretten. Essensgutscheine gelten hier nicht.` }],
    })
  }

  function smoke() {
    if (!game?.smoker || game.quittingSmoking || game.cigarettes < 1) return
    setGame({
      ...game,
      cigarettes: game.cigarettes - 1,
      timeSpent: game.timeSpent + 1,
      craving: clamp(game.craving - 38, 0, 100),
      nerve: clamp(game.nerve + 5, 0, 100),
      history: [...game.history, { turn: game.turn, label: 'Zigarette', cash: 0, note: 'Eine Zigarette senkt den Entzug und gibt kurzfristig +5 Nerven.' }],
    })
  }

  function startSmokingWithdrawal() {
    if (!game?.smoker || game.quittingSmoking) return
    setGame({
      ...game,
      quittingSmoking: true,
      timeSpent: game.timeSpent + 1,
      cleanTurns: 0,
      cigarettes: 0,
      history: [...game.history, { turn: game.turn, label: 'Tabakentzug gestartet', cash: 0, note: 'Du entsorgst den Tabak. Die ersten cleanen Zyklen erhöhen den Stress leicht, danach wird es spürbar ruhiger.' }],
    })
  }

  function setDailyAnchor(kind) {
    if (!game || game.anchorTurn === game.turn) return
    const isAppointment = kind === 'appointment'
    const routineGain = isAppointment ? 2 : 1
    const nerveGain = isAppointment ? 7 : 4
    const label = isAppointment ? 'Termin wahrgenommen' : 'Routine gesetzt'
    const note = isAppointment
      ? 'Du nimmst dir Zeit für einen vereinbarten Termin. Kein Sofort-Fix – aber ein verlässlicher Teil deines Netzes.'
      : 'Du legst für heute einen einfachen Ablauf fest: essen, Rückzug, ein machbarer nächster Schritt.'
    setGame({
      ...game,
      anchorTurn: game.turn,
      routine: clamp((game.routine || 0) + routineGain, 0, 6),
      nerve: clamp(game.nerve + nerveGain, 0, 100),
      timeSpent: game.timeSpent + 1,
      history: [...game.history, { turn: game.turn, label, cash: 0, note }],
    })
  }

  function moveToPlace(place) {
    const reachable = game?.networkAccess || arePlacesConnected(game?.place, place?.id)
    if (!game || !place || game.place === place.id || game.lastMoveTurn === game.turn || !reachable || (place.locked && !game.custodyUnlocked)) return
    const chapter = place.id === 'care' ? 'behandlung' : place.id === 'custody' ? 'haft' : 'frei'
    setGame({
      ...game,
      place: place.id,
      chapter,
      lastMoveTurn: game.turn,
      timeSpent: game.timeSpent + 1,
      history: [...game.history, { turn: game.turn, label: `Ort: ${place.label}`, cash: 0, note: `${place.text} Der Ortswechsel kostet einen Zeitschritt, nicht den ganzen Zyklus.` }],
    })
  }

  function usePlaceAction() {
    if (!game || game.placeActionTurn === game.turn) return
    const action = PLACE_ACTIONS[game.place]
    if (!action || game.cash + action.cash < 0) return
    setGame({
      ...game,
      cash: game.cash + action.cash,
      nerve: clamp(game.nerve + (action.nerve || 0), 0, 100),
      thirst: clamp(game.thirst + (action.thirst || 0), 0, 100),
      fame: clamp(game.fame + (action.fame || 0), 0, 100),
      edge: clamp(game.edge + (action.edge || 0), 0, 30),
      routine: clamp((game.routine || 0) + (action.routine || 0), 0, 6),
      connections: clamp((game.connections || 0) + (action.connections || 0), 0, 12),
      networkAccess: game.networkAccess || Boolean(action.network),
      placeActionTurn: game.turn,
      timeSpent: game.timeSpent + 1,
      history: [...game.history, { turn: game.turn, label: `${PLAY_SPACES.find((place) => place.id === game.place)?.label}: ${action.label}`, cash: action.cash, note: action.note }],
    })
  }

  function joinFaction(invitation) {
    if (!game || game.faction || !invitation) return
    setGame({
      ...game,
      faction: invitation.id,
      factionRank: 1,
      timeSpent: game.timeSpent + 1,
      history: [...game.history, { turn: game.turn, label: `${invitation.label}: aufgenommen`, cash: 0, note: `Du wirst eingeladen, nicht verkauft. Rang 1: Aufträge und Vertrauen bauen sich ab jetzt sichtbar auf.` }],
    })
  }

  function declineFaction(invitation) {
    if (!game || !invitation) return
    setGame({
      ...game,
      declinedFactions: [...(game.declinedFactions || []), invitation.id],
      timeSpent: game.timeSpent + 1,
      history: [...game.history, { turn: game.turn, label: `${invitation.label}: vertagt`, cash: 0, note: 'Du lässt die Einladung offen, ohne dich zu binden. Dein Weg bleibt deiner.' }],
    })
  }

  function workFaction() {
    if (!game || !faction || game.factionJobTurn === game.turn) return
    const jobs = game.factionJobs + 1
    const rank = clamp(1 + Math.floor(jobs / 3), 1, 9)
    const outcomes = {
      signal: { cash: 550, nerve: -3, fame: 2, connections: 0, note: 'Du lieferst einen klaren Lizenz- und Projektauftrag. Klein, sauber, weiter.' },
      neon: { cash: 800, nerve: -7, fame: 3, connections: 0, note: 'Eine Nachtschicht im Neonhafen: Tempo, Risiko, keine Abkürzung ohne Folgen.' },
      parkkreis: { cash: 150, nerve: 5, fame: 2, connections: 1, note: 'Du hilfst beim Parkkreis. Weniger Cash, mehr Menschen, die deinen Namen kennen.' },
    }[faction.id]
    setGame({
      ...game,
      factionJobs: jobs,
      factionRank: rank,
      factionJobTurn: game.turn,
      cash: game.cash + outcomes.cash,
      nerve: clamp(game.nerve + outcomes.nerve, 0, 100),
      fame: clamp(game.fame + outcomes.fame, 0, 100),
      connections: clamp((game.connections || 0) + outcomes.connections, 0, 12),
      timeSpent: game.timeSpent + 1,
      history: [...game.history, { turn: game.turn, label: `${faction.label}: Auftrag`, cash: outcomes.cash, note: `${outcomes.note} Rang ${rank}, Auftrag ${jobs}.` }],
    })
  }

  function openLedger() {
    if (!game) return
    setLedgerDraft({
      cash: String(Math.round(game.cash)),
      savings: String(Math.round(game.savings)),
      protectedFunds: String(Math.round(game.protectedFunds)),
      debt: String(Math.round(game.debt)),
      fixedCosts: String(Math.round(game.fixedCosts)),
      onlineBanking: game.onlineBanking,
      smoker: game.smoker,
    })
    setLedgerOpen(true)
  }

  function applyLedger() {
    if (!game) return
    const numberFrom = (value) => Math.max(0, Number(String(value).replace(',', '.')) || 0)
    const cash = numberFrom(ledgerDraft.cash)
    const savings = numberFrom(ledgerDraft.savings)
    const protectedFunds = numberFrom(ledgerDraft.protectedFunds)
    const debt = numberFrom(ledgerDraft.debt)
    const baseAssets = savings + protectedFunds
    const fixedCosts = numberFrom(ledgerDraft.fixedCosts)
    const onlineBanking = game.guardianActive ? false : Boolean(ledgerDraft.onlineBanking)
    const smoker = game.smoker
    const smokingConfigured = game.smokingConfigured
    const nextCash = cash
    const provisionalGame = { ...game, cash: nextCash, baseAssets, savings, protectedFunds, debt, fixedCosts, onlineBanking, smoker, smokingConfigured }
    const status = 'playing'
    const accessNote = game.guardianActive ? 'Du hast kein eigenes Online-Banking; der Betreuer kann später eine Freigabe geben.' : onlineBanking ? 'Eigenes Online-Banking ist eingerichtet; der Markt kann ab Zyklus 4 öffnen.' : 'Ohne Online-Banking bleibt der Markt geschlossen, bis du es im Finanzprofil aktivierst.'
    const note = `Finanzprofil gespeichert. ${accessNote} ${debt > 0 ? `Offene Schulden: ${formatMoney(debt)} €. Das ist dein schwieriger Start.` : 'Kein Schuldenstand eingetragen.'} ${smoker ? 'Tabaksucht ist für diesen Run aktiv.' : 'Rauchen kannst du später jederzeit im Supermarkt beginnen.'}`
    const nextGame = {
      ...game,
      status,
      cash: nextCash,
      baseAssets,
      savings,
      protectedFunds,
      debt,
      insolvencyActive: debt > 0,
      fixedCosts,
      onlineBanking,
      smoker,
      smokingConfigured,
      event: status === 'playing' ? game.event : null,
      peak: Math.max(game.peak, netWorth(provisionalGame)),
      history: [...game.history, { turn: game.turn, label: 'Finanzprofil', cash: 0, note }],
    }
    setGame(nextGame)
    setLedgerOpen(false)
  }

  function loadPersonalRun() {
    try {
      const saved = JSON.parse(localStorage.getItem(PERSONAL_SAVE_KEY))
      if (!saved?.game || saved.status !== 'playing') return
      setSaveSlot('personal')
      setGame(normalizeGame(saved.game))
      setLedgerOpen(false)
      setScreen('game')
    } catch {
      localStorage.removeItem(PERSONAL_SAVE_KEY)
    }
  }

  function openCharacterCreator() {
    setSaveSlot('first-flat')
    setGame(null)
    setLedgerOpen(false)
    setName('')
    setAge('18')
    setHousingId('first-flat')
    setAvatarType('human')
    setPresetId(null)
    setOriginId(ORIGINS[0].id)
    setScreen('start')
  }

  function restart() {
    localStorage.removeItem(activeSaveKey)
    setGame(null)
    setSpilo(null)
    setName('')
    setOriginId(ORIGINS[0].id)
    setLedgerOpen(false)
    openCharacterCreator()
  }

  if (screen === 'cinema') {
    const scene = CINEMA_SCENES.find((item) => item.id === cinemaSceneId) || CINEMA_SCENES[0]
    const sceneIndex = CINEMA_SCENES.findIndex((item) => item.id === scene.id)
    const previousScene = CINEMA_SCENES[(sceneIndex - 1 + CINEMA_SCENES.length) % CINEMA_SCENES.length]
    const nextScene = CINEMA_SCENES[(sceneIndex + 1) % CINEMA_SCENES.length]
    const camera = CINEMA_CAMERAS.find((item) => item.id === cinemaCameraId) || CINEMA_CAMERAS[0]

    return (
      <main className="shell cinema-screen">
        <header className="brand-row">
          <div className="brand">ISSO<span>.TV</span></div>
          <div className="edition">FILMISCHE STADTFAHRT / 3D-DIORAMA</div>
          <button className="quiet-button cinema-return" onClick={() => setScreen(cinemaReturnScreen === 'game' && game ? 'game' : 'start')}>↩ {cinemaReturnScreen === 'game' && game ? 'ZURÜCK ZUM RUN' : 'ZURÜCK ZUR FIGUR'}</button>
        </header>

        <section className="cinema-layout" aria-label="Filmische 3D-Stadtfahrt durch Strammburg">
          <div
            className={`cinema-stage scene-${scene.id} camera-${camera.id}`}
            style={{ '--yaw': `${cinemaLook.yaw}deg`, '--pitch': `${cinemaLook.pitch}deg` }}
            onPointerMove={steerCinema}
            onPointerLeave={() => setCinemaLook({ yaw: 0, pitch: 0 })}
          >
            <div className="cinema-grain" aria-hidden="true" />
            <div className="cinema-world" aria-hidden="true">
              <div className="cinema-sky"><i>✦</i><b>STRAMMBURG</b></div>
              <div className="cinema-horizon cinema-horizon-far" />
              <div className="cinema-horizon cinema-horizon-near" />
              <div className="cinema-water" />
              <div className="cinema-road"><span /><span /><span /></div>
              <div className="cinema-building cinema-building-left"><i>ISSO</i></div>
              <div className="cinema-building cinema-building-right"><i>353L</i></div>
              <div className="cinema-gate"><b>{scene.label.toUpperCase()}</b></div>
              <div className="cinema-light cinema-light-left" />
              <div className="cinema-light cinema-light-right" />
              <div className="cinema-subject">{game?.avatarLabel?.toLowerCase().includes('esel') ? '🫏' : '✦'}</div>
            </div>
            <div className="cinema-stage-copy">
              <span>{scene.icon} {scene.district}</span>
              <strong>{scene.label}</strong>
              <small>↔ MAUS BEWEGEN / BLICK DURCH DIE SZENE</small>
            </div>
            <div className="cinema-frame-counter">EINSTELLUNG {String(sceneIndex + 1).padStart(2, '0')} / {String(CINEMA_SCENES.length).padStart(2, '0')}</div>
          </div>

          <aside className="cinema-panel">
            <p className="eyebrow">{scene.district}</p>
            <h1>{scene.title}</h1>
            <p>{scene.text}</p>
            <div className="cinema-detail"><b>{scene.icon}</b><span>{scene.detail}</span></div>

            <div className="cinema-camera-controls" aria-label="Kameraperspektive">
              <span className="panel-label">KAMERA / WAS DU SIEHST</span>
              {CINEMA_CAMERAS.map((item) => <button key={item.id} className={item.id === camera.id ? 'selected' : ''} onClick={() => setCinemaCameraId(item.id)}><i>{item.icon}</i><strong>{item.label}</strong><small>{item.detail}</small></button>)}
            </div>

            <div className="cinema-drive-controls" aria-label="Szenenfahrt">
              <button onClick={() => setCinemaScene(previousScene.id)}>← {previousScene.label.toUpperCase()}</button>
              <button className="cinema-next" onClick={() => setCinemaScene(nextScene.id)}>NÄCHSTE EINSTELLUNG <span>→</span></button>
            </div>
            <p className="cinema-safe-note">✦ Die Stadtfahrt kostet keinen Zug und verändert keine Werte. Sie macht Schauplätze fühlbar, bevor du sie spielst.</p>
          </aside>
        </section>

        <nav className="cinema-timeline" aria-label="Schauplätze anfahren">
          {CINEMA_SCENES.map((item, index) => <button key={item.id} className={item.id === scene.id ? 'selected' : ''} onClick={() => setCinemaScene(item.id)}><i>{String(index + 1).padStart(2, '0')}</i><span>{item.icon} {item.label}</span></button>)}
        </nav>
        <MadeInHamburg />
      </main>
    )
  }

  if (screen === 'start') {
    return (
      <main className="shell start-screen">
        <header className="brand-row">
          <div className="brand">ISSO<span>.TV</span></div>
          <div className="edition">MASTER EDITION / CHARAKTER ERSTELLEN</div>
        </header>
        <section className="entry-grid">
          <div className="entry-copy">
            <p className="eyebrow">STRAMMBURG / STADTRUN</p>
            <h1>ISSO.TV<br />Master Edition.</h1>
            <p className="intro">Du bestimmst die Figur und ihren Weg. Neu in Strammburg, ohne feste Crew und mit einer Stadt voller eigener Regeln. Euro, Nerven, Routinen, Renommee und Ideen entscheiden über deinen Run.</p>
            <figure className="donkey-hero"><img src={donkeyHero} alt="Der Esel, Hauptfigur von ISSO.TV" /><figcaption>ISSO.TV / DER ESEL IM HAFEN</figcaption></figure>
            <div className="world-intro"><span>STRAMMBURG / {WORLD.originDistrict.toUpperCase()}</span><strong>{WORLD.origin}: IDEEN WERDEN HIER ZU WEGEN.</strong><p>{WORLD.castle} auf {WORLD.island} ist kein Startpunkt. Es ist ein Kapitel, das du dir erspielst.</p></div>
            <p className="legal-note">Ein fiktiver Stadtrun mit simulierten Märkten. Kein Echtgeld, keine Käufe, kein Konto.</p>
            <p className={`market-state ${marketStatus}`}>{marketStatus === 'loading' ? '◌ LIVE-KURSE WERDEN GELADEN …' : marketStatus === 'live' ? '● LIVE-KURSE GELADEN' : '△ KURSDIENST NICHT ERREICHBAR · STARTWERTE AKTIV'}</p>
            <button className="cinema-entry-button" onClick={() => openCinema('hq1')}><span>✦</span> STRAMMBURG IN 3D DURCHFAHREN <i>→</i></button>
          </div>
          <div className="entry-panel">
            <label className="field-label" htmlFor="name">DEIN NAME</label>
            <input id="name" value={name} maxLength="16" onChange={(event) => setName(event.target.value)} placeholder="Alias eingeben" autoComplete="off" />
            <span className="field-label origin-label">STARTFIGUR / GLEICHE WERTE, EIGENE PROLOGE</span>
            <div className="preset-grid">
              {CHARACTER_PRESETS.map((preset) => (
                <button className={`preset-card ${preset.id === presetId ? 'selected' : ''}`} onClick={() => applyCharacterPreset(preset)} key={preset.id}>
                  <i>{preset.icon}</i><strong>{preset.name}</strong><span>{preset.identity} · {preset.age}</span><small>{preset.detail}</small>
                </button>
              ))}
            </div>
            <label className="field-label origin-label" htmlFor="age">DEIN ALTER</label>
            <input id="age" type="number" min="16" max="99" value={age} onChange={(event) => setAge(event.target.value)} />
            <span className="field-label origin-label">DEINE FORM</span>
            <div className="origin-list">
              {CHARACTER_FORMS.map((item) => (
                <button className={`origin ${item.id === avatarType ? 'selected' : ''}`} onClick={() => setAvatarType(item.id)} key={item.id}>
                  <span className="origin-title">{item.icon} {item.label}</span>
                  <span className="origin-detail">{item.detail}</span>
                </button>
              ))}
            </div>
            {avatarType === 'animal' && <>
              <span className="field-label origin-label">DEINE TIERFORM / NUR STORY, GLEICHE STARTWERTE</span>
              <div className="origin-list animal-list">
                {ANIMAL_FORMS.map((animal) => (
                  <button className={`origin ${animal.id === animalId ? 'selected' : ''}`} onClick={() => setAnimalId(animal.id)} key={animal.id}>
                    <span className="origin-title">{animal.icon} {animal.label}</span>
                    <span className="origin-detail">{animal.detail}</span>
                  </button>
                ))}
              </div>
            </>}
            <span className="field-label origin-label">DEINE WOHNSITUATION</span>
            <div className="origin-list">
              {HOUSING.map((item) => (
                <button className={`origin ${item.id === housingId ? 'selected' : ''}`} onClick={() => setHousingId(item.id)} key={item.id}>
                  <span className="origin-title">{item.label}</span>
                  <span className="origin-detail">{item.detail}</span>
                  <span className="origin-stats">{formatMoney(item.fixedCosts)} € FIXKOSTEN / ZYKLUS</span>
                </button>
              ))}
            </div>
            <span className="field-label origin-label">DEIN START</span>
            <div className="origin-list">
              {ORIGINS.map((item) => (
                <button className={`origin ${item.id === originId ? 'selected' : ''}`} onClick={() => setOriginId(item.id)} key={item.id}>
                  <span className="origin-title">{item.label}</span>
                  <span className="origin-detail">{item.detail}</span>
                  <span className="origin-stats">{formatMoney(item.cash)} € · {item.nerve} NERVEN · {item.fame} RENOMMEE</span>
                </button>
              ))}
            </div>
            <button className="primary-button" onClick={startGame}>RUN IN STRAMMBURG STARTEN <span>→</span></button>
            {localStorage.getItem(PERSONAL_SAVE_KEY) && <button className="saved-run-button" onClick={loadPersonalRun}>↩ DEINEN PERSÖNLICHEN RUN LADEN</button>}
          </div>
        </section>
        <MadeInHamburg />
      </main>
    )
  }

  if (screen === 'result' && game) {
    const won = game.status === 'won'
    return (
      <main className="shell result-screen">
        <header className="brand-row">
          <div className="brand">ISSO<span>.TV</span></div>
          <div className="edition">MASTER EDITION / RUN REPORT</div>
        </header>
        <section className={`result-card ${won ? 'winner' : 'loser'}`}>
          <p className="eyebrow">{won ? 'MASTER RUN' : 'RUN BEENDET'}</p>
          <h1>{won ? 'Du bleibst am Tisch.' : 'Der Tisch bleibt nicht.'}</h1>
          <p className="result-copy">{currentLog?.note ?? (won ? 'Kapital und Renommee haben den Zyklus überlebt.' : 'Im nächsten Lauf ist nicht alles neu — nur die Illusion der Kontrolle.')}</p>
          <div className="result-stats">
            <Stat icon="◈" label="ENDVERMÖGEN" value={`${formatMoney(netWorth(game))} €`} description="Euro und Wert aller Krypto-Positionen zusammen." />
            <Stat icon="↑" label="BESTWERT" value={`${formatMoney(game.peak)} €`} description="Höchster Vermögenswert dieses Runs." />
            <Stat icon="★" label="RENOMMEE" value={game.fame} description="Deine Sichtbarkeit und dein Einfluss in der Stadt." />
            <Stat icon="♥" label="NERVEN" value={game.nerve} description="Deine Belastbarkeit. Bei null wird daraus ein Rückkehrkapitel, kein Ende." />
          </div>
          <div className="run-history">
            {game.history.slice(1).map((entry) => (
              <div className="history-line" key={`${entry.turn}-${entry.label}`}>
                <span>{String(entry.turn).padStart(2, '0')}</span><b>{entry.label}</b><i className={entry.cash >= 0 ? 'positive' : 'negative'}>{entry.cash >= 0 ? '+' : ''}{formatMoney(entry.cash)} €</i>
              </div>
            ))}
          </div>
          <button className="primary-button" onClick={restart}>NEUER RUN <span>→</span></button>
        </section>
        <MadeInHamburg />
      </main>
    )
  }

  if (ledgerOpen && game) {
    return (
      <main className="shell ledger-screen">
        <header className="brand-row"><div className="brand">ISSO<span>.TV</span></div><div className="edition">HAUSHALTSBUCH / DEINE BASIS</div></header>
        <section className="ledger-card">
          <p className="eyebrow">FINANZPROFIL · ZYKLUS {game.turn}</p>
          <h1>Deine Zahlen.</h1>
          <p>Trage dein deutsches Finanzprofil ein. Das ist ein Spielsystem: keine echten Bankdaten, keine Rechtsberatung und keine Verbindung zu Banken.</p>
          <p className="legal-note">{game.insolvencyActive ? `SCHWIERIGER START: laufende Insolvenz im Spiel seit ${game.insolvencyStarted}. Du entscheidest selbst – Unterstützung und Anrufe sind Schlüssel, keine Kontrolle über dich.` : 'DEIN START: Du setzt die Werte selbst. Später führen Konsequenzen, nicht Menüs, durch die Geschichte.'}</p>
          <div className="ledger-fields">
            <label><span>▣ GIROKONTO</span><small>Deine direkt verfügbaren, liquiden Mittel.</small><input type="number" min="0" step="100" value={ledgerDraft.cash} onChange={(event) => setLedgerDraft({ ...ledgerDraft, cash: event.target.value })} /></label>
            <label><span>▤ SPARBUCH</span><small>Rücklage außerhalb des täglichen Girokontos.</small><input type="number" min="0" step="100" value={ledgerDraft.savings} onChange={(event) => setLedgerDraft({ ...ledgerDraft, savings: event.target.value })} /></label>
            <label><span>◇ SCHUTZKONTO</span><small>Geschützte Reserve im Spiel. Sie zählt zum Vermögen, aber nicht zur Liquidität.</small><input type="number" min="0" step="100" value={ledgerDraft.protectedFunds} onChange={(event) => setLedgerDraft({ ...ledgerDraft, protectedFunds: event.target.value })} /></label>
            <label><span>↓ OFFENE SCHULDEN</span><small>Dein Schuldenstand im Spiel. Er zählt gegen dein Vermögen und macht den Start schwerer.</small><input type="number" min="0" step="100" value={ledgerDraft.debt} onChange={(event) => setLedgerDraft({ ...ledgerDraft, debt: event.target.value })} /></label>
            <label><span>▤ FIXKOSTEN PRO ZYKLUS</span><small>Wird in jedem dritten Zug abgezogen.</small><input type="number" min="0" step="100" value={ledgerDraft.fixedCosts} onChange={(event) => setLedgerDraft({ ...ledgerDraft, fixedCosts: event.target.value })} /></label>
          </div>
          {game.guardianActive ? <div className="bank-mode"><span>◌ BANKZUGANG</span><div className="bank-locked">○ KEIN EIGENES ONLINE-BANKING <small>Der Betreuer erledigt Online-Vorgänge nach deiner Entscheidung. Ein Anruf holt die Freigabe.</small></div></div> : <div className="bank-mode"><span>◌ BANKZUGANG</span><button className={ledgerDraft.onlineBanking ? 'selected' : ''} onClick={() => setLedgerDraft({ ...ledgerDraft, onlineBanking: true })}>● MIT ONLINE-BANKING <small>Markt ab Zyklus 4 verfügbar</small></button><button className={!ledgerDraft.onlineBanking ? 'selected' : ''} onClick={() => setLedgerDraft({ ...ledgerDraft, onlineBanking: false })}>○ OHNE ONLINE-BANKING <small>Haushalts- und Story-Run ohne Markt</small></button></div>}
          <p className="locked-choice">▣ TABAK IST EINE OPTION IM SUPERMARKT. BEIM ERSTEN KAUF FÄNGST DU AN ZU RAUCHEN UND AKTIVIERST DEN ENTZUG FÜR DIESEN RUN.</p>
          <div className="ledger-total">◈ DEIN NETTO-START: {formatMoney((Number(ledgerDraft.cash) || 0) + (Number(ledgerDraft.savings) || 0) + (Number(ledgerDraft.protectedFunds) || 0) - (Number(ledgerDraft.debt) || 0))} €</div>
          <div className="ledger-actions"><button className="secondary-button" onClick={() => setLedgerOpen(false)}>ZURÜCK</button><button className="primary-button" onClick={applyLedger}>WERTE ÜBERNEHMEN <span>→</span></button></div>
        </section>
        <MadeInHamburg />
      </main>
    )
  }

  if (screen === 'spilo' && game && spilo) {
    const hasFoodOrder = game.foodOrderTurn === game.turn
    return (
      <main className="shell spilo-screen">
        <header className="brand-row"><div className="brand">ISSO<span>.TV</span></div><div className="edition">SPILO / SPRUNGFENSTER</div></header>
        <section className="spilo-card">
          <p className="eyebrow">{formatMoney(spilo.stake)} € SIND IM SPIEL</p>
          <h1>Spring nicht<br />zu früh.</h1>
          <p className="spilo-copy">Einsatz frei wählen. Triff das orange Fenster: Einsatz zurück, das Doppelte oder mit perfektem Sprung das Fünffache. Daneben ist dein Einsatz weg.</p>
          <div className="spilo-stakes" aria-label="Einsatz wählen">
            {[10, 20, 50, 100].map((stake) => <button key={stake} className={spilo.stake === stake ? 'selected' : ''} disabled={game.cash < stake} onClick={() => setSpilo({ stake })}>{formatMoney(stake)} €</button>)}
          </div>
          <div className={`spilo-food-warning ${hasFoodOrder ? 'safe' : ''}`}>{hasFoodOrder ? '● ESSENSKORB FÜR DIESE WOCHE IST GESICHERT' : '△ KEIN ESSENSKORB: DIESER SPRUNG KANN DEN RUN BEENDEN'}</div>
          <div className="jump-track" aria-label={`Sprungmeter ${jumpMeter} von 100`}>
            <i className="jump-zone" />
            <b style={{ left: `${jumpMeter}%` }} />
          </div>
          <div className="jump-scale"><span>ZU FRÜH</span><strong>SPRINGFENSTER</strong><span>ZU SPÄT</span></div>
          <button className="jump-button" onClick={resolveSpilo}>↗ JETZT SPRINGEN</button>
          <button className="spilo-back" onClick={() => { setSpilo(null); setScreen('game') }}>ZURÜCK ZUM RUN</button>
        </section>
        <MadeInHamburg />
      </main>
    )
  }

  if (game?.event) {
    return (
      <main className="shell story-screen">
        <header className="brand-row"><div className="brand">ISSO<span>.TV</span></div><div className="edition">{game.event.act}</div></header>
        <section className="story-card">
          <p className="eyebrow">{game.event.act}</p>
          <h1>{game.event.title}</h1>
          <p>{game.event.text}</p>
          <div className="story-choices">
            {game.event.choices.map((choice) => (
              <button key={choice.label} onClick={() => resolveStory(choice)}>
                <strong>{choice.label}</strong><span>{choice.detail}</span><i>ENTSCHEIDEN <b>→</b></i>
              </button>
            ))}
          </div>
        </section>
        <MadeInHamburg />
      </main>
    )
  }

  if (!game) return null

  return (
    <main className="shell game-screen">
      <header className="brand-row">
        <div className="brand">ISSO<span>.TV</span></div>
        <div className="run-name">{game.name.toUpperCase()} <span>·</span> {game.avatarLabel?.toUpperCase()} <span>·</span> {game.age ? `${game.age} JAHRE · ` : ''}ZYKLUS {game.turn} / ENDLOS</div>
        <div className="world-clock">⌚ {formatWorldClock(worldNow)}</div>
        {saveSlot === 'first-flat' ? <button className="quiet-button" onClick={loadPersonalRun}>PERSÖNLICHER RUN</button> : <button className="quiet-button" onClick={openCharacterCreator}>NEUE STORY</button>}
        <button className="quiet-button" onClick={() => openCinema(game.place)}>✦ 3D-STADTFAHRT</button>
        <button className="quiet-button" onClick={openLedger}>FINANZPROFIL</button>
        <button className="quiet-button" onClick={restart}>RUN VERWERFEN</button>
      </header>

      <section className="hud">
        <Stat icon="€" label="EURO" value={`${formatMoney(game.cash)} €`} hint="liquide Mittel" alert={game.cash < 0} description="Sofort verfügbares Geld für Einsätze und Käufe." />
        <Stat icon="◈" label="VERMÖGEN" value={`${formatMoney(netWorth(game))} €`} hint={`Ziel: ${formatMoney(TARGET_CASH)} €`} alert={netWorth(game) < 0} description="Euro plus aktueller Wert deiner Krypto-Positionen." />
        <Stat icon="♥" label="NERVEN" value={`${game.nerve}/100`} alert={game.nerve < 25} description="Belastbarkeit. Bei null beginnt ein Rückkehrkapitel, der Run bleibt deiner." />
        <Stat icon="◒" label="HUNGER" value={`${game.hunger}/100`} hint="Essen hält dich im Run" alert={game.hunger < 25} description="Du brauchst jede Woche einen Essenskorb. Wenn es knapp wird, startet ein Versorgungskapitel statt eines Endes." />
        <Stat icon="◓" label="DURST" value={`${game.thirst}/100`} hint="Getränke auffüllen" alert={game.thirst < 25} description="Getränke aus dem Supermarkt oder online füllen deinen Durst." />
        <Stat icon="★" label="RENOMMEE" value={`${game.fame}/100`} hint="Ziel: 65" description="Wird für den Master-Run benötigt und öffnet Story-Gewicht." />
        <Stat icon="◉" label="INSTINKT" value={`${game.edge}/30`} hint="verbessert Risiko" description="Erhöht die Chancen bei riskanten Aktionen." />
        <Stat icon="↺" label="ROUTINE" value={`${game.routine || 0}/6`} hint="kleine Anker" description="Essen und bewusst gewählte Anker geben im Run etwas Widerstand gegen Druck. Sie ersetzen keine Hilfe außerhalb des Spiels." />
        {game.newInTown && <Stat icon="⌘" label="KONTAKTE" value={`${game.connections || 0}/12`} hint="Strammburg" description="Menschen und Orte, bei denen du nicht bei null anfangen musst. Ein Kontakt bleibt freiwillig und ist nie eine Schuld." />}
        <Stat icon="⌛" label="ZEIT" value={`${game.timeSpent} Schritte`} hint="jede Wahl zählt" description="Große Entscheidungen kosten einen Zyklus, kurze Schlüsselhandlungen einen Zeitschritt." />
        {game.smoker && <Stat icon="▣" label={game.quittingSmoking ? 'CLEAN' : 'ENTZUG'} value={game.quittingSmoking ? `${game.cleanTurns}/6` : `${game.craving}/100`} hint={game.quittingSmoking ? 'Tabakentzug' : `${game.cigarettes} Zigaretten`} alert={game.quittingSmoking ? game.cleanTurns < 3 : game.craving >= 70} description={game.quittingSmoking ? 'Die ersten cleanen Zyklen sind stressiger, danach lässt der Druck nach.' : 'Du hast im Run mit Rauchen angefangen. Tabak senkt den Entzug.'} />}
      </section>

      <section className="key-route" aria-label="Vorgeschlagener nächster Schlüssel">
        <div><span className="panel-label">⌘ NÄCHSTER SCHLÜSSEL</span><strong>{keySuggestion.title}</strong><p>{keySuggestion.text}</p></div>
        <div className="key-route-action"><small>ZEIT: {keySuggestion.time}</small><button disabled={keySuggestion.id === 'choice'} onClick={followKeySuggestion}>{keySuggestion.label} <span>→</span></button></div>
      </section>

      {cityBulletin && <section className="city-bulletin" aria-label="Strammburg Stadtfunk"><span>{cityBulletin.icon} STADTFUNK</span><strong>{cityBulletin.title}</strong><p>{cityBulletin.text}</p></section>}

      {storyArc && <section className={`story-arc story-arc-${storyArc.id}`} aria-label="Aktueller Story-Abschnitt">
        <span>{storyArc.label}</span><div><strong>{storyArc.title}</strong><p>{storyArc.text}</p></div><small>STORY LÄUFT WEITER <b>→</b></small>
      </section>}

      {messages.length > 0 && <section className="message-panel" aria-label="Strammburg Nachrichten">
        <div className="message-heading"><span className="panel-label">◌ STRAMMBURG-NACHRICHTEN</span><p>{messages.length} IMPULS{messages.length === 1 ? '' : 'E'} · KEINE ANTWORTPFLICHT</p></div>
        <div className="message-list">{messages.map((message) => <article key={`${message.from}-${message.text}`}><i>{message.icon}</i><div><strong>{message.from}</strong><small>{message.meta}</small><p>{message.text}</p></div></article>)}</div>
      </section>}

      {game.newInTown && <section className="anchor-panel" aria-label="Alltagsanker">
        <div><span className="panel-label">↺ ALLTAGSANKER / EINMAL PRO ZYKLUS</span><strong>{game.anchorTurn === game.turn ? 'Anker für diese Woche gesetzt' : 'Sicherheit wird klein gebaut.'}</strong><p>Ein bewusster Ablauf oder ein Termin gibt Struktur. Er ersetzt keine professionelle Hilfe – im Spiel schafft er nur etwas mehr Halt für den nächsten Zug.</p></div>
        <div className="anchor-actions">
          <button disabled={game.anchorTurn === game.turn} onClick={() => setDailyAnchor('routine')}>↺ ABLAUF SETZEN <small>+1 ROUTINE</small></button>
          <button disabled={game.anchorTurn === game.turn} onClick={() => setDailyAnchor('appointment')}>⊹ TERMIN WAHRNEHMEN <small>+2 ROUTINE</small></button>
        </div>
      </section>}

      {factionOffer && <section className="faction-panel invitation" aria-label="Gruppeneinladung">
        <div><span className="panel-label">{factionOffer.icon} EINLADUNG / DEIN WEG WURDE GESEHEN</span><strong>{factionOffer.label}</strong><p>{factionOffer.text} Du kannst dazugehören oder die Einladung vertagen. Beides ist eine Entscheidung.</p></div>
        <div className="faction-actions"><button onClick={() => joinFaction(factionOffer)}>RANG 1 ANNEHMEN <span>→</span></button><button className="quiet-faction-button" onClick={() => declineFaction(factionOffer)}>NOCH NICHT</button></div>
      </section>}

      {faction && <section className="faction-panel" aria-label="Deine Gruppierung">
        <div><span className="panel-label">{faction.icon} GRUPPIERUNG / RANG {game.factionRank}</span><strong>{faction.label}</strong><p>{faction.text} Aufträge bringen Rang, Cash und Folgen. Nicht jede Woche muss ein Auftrag sein.</p></div>
        <div className="faction-actions"><button disabled={game.factionJobTurn === game.turn} onClick={workFaction}>AUFTRAG MACHEN <span>{game.factionJobTurn === game.turn ? 'ERLEDIGT' : `RANG ${game.factionRank}`}</span></button><small>{game.factionJobs} AUFTRÄGE · NÄCHSTER RANG IN {Math.max(0, 3 - (game.factionJobs % 3))}</small></div>
      </section>}

      <section className="places-panel" aria-label="Schauplätze">
        <div className="places-heading"><span className="panel-label">⌂ SCHAUORTE / {game.chapter.toUpperCase()}</span><div className="places-heading-actions"><p>{game.lastMoveTurn === game.turn ? 'ORTSWECHSEL FÜR DIESEN ZYKLUS GENOMMEN' : 'EIN ORTSWECHSEL PRO ZYKLUS'}</p><button onClick={() => openCinema(game.place)}>✦ ORT IN 3D ANSEHEN</button></div></div>
        <div className="strammburg-map" aria-label="Schematische Karte von Strammburg">
          <span className="map-water">STRAMM</span><span className="map-title">STRAMMBURG</span>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {MAP_LINKS.map(([from, to]) => {
              const a = MAP_NODES.find((node) => node.id === from)
              const b = MAP_NODES.find((node) => node.id === to)
              return <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            })}
          </svg>
          {MAP_NODES.map((node) => {
            const place = PLAY_SPACES.find((item) => item.id === node.id)
            const locked = place.locked && !game.custodyUnlocked
            const reachable = game.networkAccess || arePlacesConnected(game.place, place.id)
            return <button key={node.id} className={`map-node ${game.place === node.id ? 'selected' : ''} ${locked || !reachable ? 'locked' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} disabled={locked || !reachable || game.place === node.id || game.lastMoveTurn === game.turn} onClick={() => moveToPlace(place)} aria-label={`${place.label}: ${locked ? 'gesperrt' : !reachable ? 'noch nicht über deine Route erreichbar' : place.text}`}>
              <i>{locked ? '▤' : place.icon}</i><span>{place.label}</span>
            </button>
          })}
        </div>
        <div className="places-grid">
          {PLAY_SPACES.map((place) => {
            const locked = place.locked && !game.custodyUnlocked
            const reachable = game.networkAccess || arePlacesConnected(game.place, place.id)
            return <button key={place.id} className={game.place === place.id ? 'selected' : ''} disabled={locked || !reachable || game.place === place.id || game.lastMoveTurn === game.turn} onClick={() => moveToPlace(place)}>
              <i>{place.icon}</i><strong>{place.label}</strong><span>{locked ? 'WIRD NUR DURCH STORYFOLGEN ERREICHBAR' : place.text}</span><small>{locked ? '▤ KONSEQUENZKAPITEL' : game.place === place.id ? '● DU BIST HIER' : '→ HINGEHEN / 1 ZEITSCHRITT'}</small>
            </button>
          })}
        </div>
        {PLACE_ACTIONS[game.place] && <div className="place-action">
          <div><span className="panel-label">⌁ ORTSAKTION / EINMAL PRO ZYKLUS</span><strong>{PLACE_ACTIONS[game.place].label}</strong><p>{PLACE_ACTIONS[game.place].detail}</p></div>
          <button disabled={game.placeActionTurn === game.turn || game.cash + PLACE_ACTIONS[game.place].cash < 0} onClick={usePlaceAction}>{game.placeActionTurn === game.turn ? 'FÜR DIESEN ZYKLUS ERLEDIGT' : `→ ${PLACE_ACTIONS[game.place].label}`}</button>
        </div>}
      </section>

      <section className="main-grid">
        <div className="decision-area">
          <div className="scene-copy">
            <p className="eyebrow">{marketOpen ? 'NÄCHSTE ENTSCHEIDUNG' : 'HAUSHALTSBUCH / GRUNDLAGEN'}</p>
            <h1>{marketOpen ? <>Was setzt du<br />heute aufs Spiel?</> : <>Erst die<br />Basis.</>}</h1>
            <p>{marketOpen ? currentLog?.note : 'Drei Zyklen für Einnahmen, Ausgaben, Reserve und Instinkt. Dann wird der Markt freigeschaltet.'}</p>
            <p className="pace-note">↗ TEMPO: Pro Zyklus eine große Entscheidung. Nebenmechaniken melden sich nur, wenn sie Folgen haben.</p>
          </div>
          <div className="action-grid">
            {availableActions.map((action) => (
              <button className="action-card" key={action.id} disabled={(action.id === 'spilo' && game.cash < 10) || Boolean(action.minimumCash && game.cash < action.minimumCash)} onClick={() => action.id === 'spilo' ? startSpilo() : action.id === 'budget' && !marketOpen ? openLedger() : resolveAction(action)}>
                <span className="action-icon">{action.icon}</span>
                <span className="action-kicker">{action.kicker}</span>
                <strong>{action.label}</strong>
                <small>{action.detail}</small>
                <em>WÄHLEN <span>→</span></em>
              </button>
            ))}
          </div>
        </div>
        <aside className="run-panel">
          <div>
            <span className="panel-label">DAUER-RUN</span>
            <div className="progress-track"><i style={{ width: `${goalProgress}%` }} /></div>
            <p>{formatMoney(netWorth(game))} / {formatMoney(TARGET_CASH)} €</p>
          </div>
          <div className="panel-rule" />
          <div className="objective">
            <span className="panel-label">ZIEL</span>
            <p>Erster Meilenstein:<br /><b>50.000 €</b> und <b>35 Renommee</b>.<br />Danach öffnet sich das nächste Kapitel.</p>
            {game.insolvencyActive && <p className="negative">↓ INSOLVENZ-START SEIT {game.insolvencyStarted}</p>}
          </div>
          <div className="panel-rule" />
          <div className="account-summary">
            <span className="panel-label">KONTO-SYSTEM</span>
            <p>▣ Giro: <b>{formatMoney(game.cash)} €</b></p>
            <p>▤ Sparbuch: <b>{formatMoney(game.savings)} €</b></p>
            <p>◇ Schutzkonto: <b>{formatMoney(game.protectedFunds)} €</b></p>
            <p>↺ Routine: <b>{game.routine || 0}/6</b> <span>· kleine Anker gegen Druck</span></p>
            {game.newInTown && <p>⌘ Kontakte: <b>{game.connections || 0}/12</b> <span>· freiwillige Stadt-Connections</span></p>}
            <p className={game.debt > 0 ? 'negative' : 'positive'}>↓ Schulden: <b>{formatMoney(game.debt)} €</b></p>
            <p>▧ Essensgutschein: <b>{formatMoney(game.foodVouchers)} €</b></p>
            <p>◒ Hunger: <b>{game.hunger}/100</b> · ◓ Durst: <b>{game.thirst}/100</b></p>
            {game.smoker && <p>▣ {game.quittingSmoking ? 'Clean' : 'Tabak'}: <b>{game.quittingSmoking ? `${game.cleanTurns}/6 Zyklen` : `${game.cigarettes} Zigaretten`}</b> · Entzug: <b>{game.craving}/100</b></p>}
            <p className={game.onlineBanking || game.guardianApproval ? 'positive' : 'negative'}>{game.onlineBanking ? '● Eigenes Online-Banking' : game.guardianApproval ? '● Betreuer-Freigabe aktiv' : '○ Betreuer-Freigabe offen'}</p>
          </div>
          <div className="panel-rule" />
          <div className="last-action">
            <span className="panel-label">LETZTER ZUG</span>
            <b>{currentLog?.label}</b>
            <p>{currentLog?.cash !== undefined && `${currentLog.cash >= 0 ? '+' : ''}${formatMoney(currentLog.cash)} €`}</p>
          </div>
        </aside>
      </section>

      <section className="symbol-legend" aria-label="Symbol-Legende">
        <span><b>€</b> liquide Euro</span><span><b>◈</b> Gesamtvermögen</span><span><b>♥</b> Nerven</span><span><b>◒</b> Hunger</span><span><b>◓</b> Durst</span><span><b>▧</b> wöchentlicher Essenskorb</span><span><b>↑ / ↓</b> Kursbewegung</span>
      </section>

      <section className={`market-board ${marketOpen ? '' : 'market-locked'}`} aria-label="Simulierter Kryptomarkt">
        <div className="market-heading"><span className="panel-label">MARKT / LIVE-START, DANN SIMULIERT</span><p>BTC · ETH · LTC · SOL · ZED</p></div>
        {!marketReady && <div className="locked-message">GESCHLOSSEN · Haushaltsbuch bis Zyklus 3 abschließen</div>}
        {marketReady && !(game.onlineBanking || game.guardianApproval) && <div className="locked-message">GESCHLOSSEN · {game.guardianActive ? 'Betreuer anrufen, damit er die Online-Abwicklung freigibt' : 'Online-Banking im Finanzprofil aktivieren, um den Markt zu nutzen'}</div>}
        <div className="market-grid">
          {game.market.map((asset) => {
            const owned = game.portfolio[asset.id]
            const lotValue = Math.round(asset.price * asset.unit)
            return (
              <article className="market-card" key={asset.id}>
                <div><strong>{asset.id}</strong><span>{asset.name}{asset.fictional ? ' / #zedcoinz' : ''}</span></div>
                <b title="Aktueller Kurs dieses Runs">◈ {formatMoney(asset.price)} €</b>
                <i className={asset.change >= 0 ? 'positive' : 'negative'}>{asset.change >= 0 ? '↑' : '↓'} {Math.abs(asset.change).toFixed(1)}%</i>
                <small title={asset.fictional ? 'Fiktiver ISSO.TV-Run-Kurs, keine reale Kryptowährung.' : 'Deine gehaltene Menge'}>{asset.fictional ? '✦ FIKTIVER RUN-KURS / HOHES RISIKO' : '▣ Bestand:'} {owned.toFixed(asset.id === 'BTC' ? 4 : ['ETH', 'SOL'].includes(asset.id) ? 2 : 0)} {asset.id}</small>
                <div className="trade-buttons">
                  <button title="Kauft eine feste Run-Position und kostet einen Zug" disabled={!marketOpen || game.cash < lotValue} onClick={() => tradeAsset(asset, 'buy')}>＋ KAUF {asset.unit} {asset.id}</button>
                  <button title="Verkauft eine gehaltene Position und kostet einen Zug" disabled={!marketOpen || owned < asset.unit} onClick={() => tradeAsset(asset, 'sell')}>− VERKAUF</button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="supermarket" aria-label="Supermarkt">
        <div className="market-heading"><span className="panel-label">▧ ESSEN, TRINKEN & TABAK</span><p>SUPERMARKT ODER ONLINE</p></div>
        <div className="supermarket-body">
          <div><strong>▧ {formatMoney(game.foodVouchers)} €</strong><span>Essensgutschein-Guthaben</span></div>
          <p>Gutscheine kaufst du selbst. Sie gelten für <b>Essen und Getränke</b>, online oder im Supermarkt. Ein Essenskorb ist <b>jede Woche Pflicht</b>; wenn er fehlt, beginnt ein Versorgungskapitel statt eines Endes.</p>
          <div className={`supermarket-status ${game.foodOrderTurn === game.turn ? 'ready' : ''}`}>{game.foodOrderTurn === game.turn ? `● WOCHE ${game.turn}: ESSEN BESTELLT` : `△ WOCHE ${game.turn}: ESSEN VOR DEM NÄCHSTEN ZUG BESTELLEN`}</div>
          <div className="supermarket-actions">
            <button className="supermarket-button" disabled={game.cash < 10} onClick={() => buyFoodVoucher(10, 'Supermarkt')}>＋ 10 € GUTSCHEIN LADEN</button>
            <button className="supermarket-button" disabled={game.cash < 10 && game.foodVouchers < 10} onClick={() => buyGroceries('Supermarkt')}>▧ ESSENSKORB / 10 €</button>
            <button className="supermarket-button" disabled={game.cash < 3 && game.foodVouchers < 3} onClick={() => buyDrink('Supermarkt')}>◓ GETRÄNK / 3 €</button>
            {(game.onlineBanking || game.guardianApproval) && <button className="supermarket-button online" disabled={game.cash < 10 && game.foodVouchers < 10} onClick={() => buyGroceries(game.guardianApproval ? 'Online-Bestellung über Betreuer' : 'Online-Bestellung')}>⌁ ESSENSKORB ONLINE</button>}
            {(game.onlineBanking || game.guardianApproval) && <button className="supermarket-button online" disabled={game.cash < 3 && game.foodVouchers < 3} onClick={() => buyDrink(game.guardianApproval ? 'Online-Bestellung über Betreuer' : 'Online-Bestellung')}>⌁ GETRÄNK ONLINE</button>}
            <button className="supermarket-button tobacco" disabled={game.cash < 8} onClick={() => buyTobacco('Supermarkt')}>{game.quittingSmoking ? '▣ RÜCKFALL / 8 €' : game.smoker ? '▣ TABAK / 8 €' : '▣ RAUCHEN ANFANGEN / 8 €'}</button>
            {game.smoker && !game.quittingSmoking && <button className="supermarket-button tobacco" disabled={game.cigarettes < 1} onClick={smoke}>◌ ZIGARETTE RAUCHEN</button>}
            {game.smoker && !game.quittingSmoking && <button className="supermarket-button tobacco quit" onClick={startSmokingWithdrawal}>↗ TABAKENTZUG STARTEN</button>}
            {game.smoker && game.quittingSmoking && <span className="clean-status">◌ CLEAN BLEIBEN: {game.cleanTurns}/6 ZYKLEN</span>}
          </div>
        </div>
      </section>
      <MadeInHamburg />
    </main>
  )
}

export default App
