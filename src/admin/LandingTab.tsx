import { FINALE_ICON, MaskIcon, stepIcon } from "@/components/landing/step-icons";
import type { LandingQuestion, LandingStep } from "@/content/landing";
import type { Photo, Video } from "@/content/types";
import {
  AddPhotoButton,
  Card,
  Lines,
  List,
  PhotoInput,
  Text,
  Toggle,
  useField,
  YouTubeInput,
} from "./fields";
import { LandingSearchFields } from "./SearchFields";

// The bar/bat mitzvah landing page's tab: one card per section, in the page's order. Field
// paths are relative to the "barMitzvahLanding" record.

const ADDRESS = "/bar-mitzvah-clips";
const CONSENT = "מעלים רק עם הסכמה של המצולמים, ושל ההורים כשמצולמים ילדים";
const PARAGRAPHS = (max: number) => `Enter מתחיל פסקה חדשה (עד ${max} פסקאות)`;

/** One clip: its cover (decorative: the title names it), its title and its YouTube link. */
function ClipFields({ path }: { path: string }) {
  const { value: youtubeId } = useField<string>(`${path}.youtubeId`);
  return (
    <>
      <PhotoInput
        path={`${path}.thumb`}
        label="תמונת כריכה"
        hint="בלי תמונה, האתר מציג את תמונת הכריכה מיוטיוב"
        aspect="16 / 10"
        decorative
        removable="שימוש בכריכה מיוטיוב"
        {...(youtubeId ? { fallback: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` } : {})}
      />
      <Text
        path={`${path}.title`}
        label="שם הסרטון"
        hint="חובה לפי הצהרת הנגישות: כך נקרא כפתור הצפייה לגולשים עם קורא מסך"
      />
      <YouTubeInput path={`${path}.youtubeId`} />
    </>
  );
}

/** The step's icon, as on the page (set in the code, by the step's place in the list). */
function StepIconPreview({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3">
      <MaskIcon name={name} size="h-14 w-14" className="text-olive-deep" />
      <span className="text-[13px] leading-snug text-ink/65">האייקון נקבע לפי מקום השלב ברשימה</span>
    </div>
  );
}

const newClip = (): Video => ({ title: "", youtubeId: "" });

type Shot = Photo & { ratio?: number };

/** A testimonial screenshot, previewed at its own shape (saved on upload). */
function ShotInput({ path }: { path: string }) {
  const { value: ratio } = useField<number | undefined>(`${path}.ratio`);
  return (
    <PhotoInput
      path={path}
      label="צילום מסך"
      hint="בתיאור כותבים את מילות ההמלצה, כדי שגם גולשים עם קורא מסך יוכלו לקרוא אותה"
      aspect={`${(ratio ?? 0.6).toFixed(3)} / 1`}
      withRatio
    />
  );
}

export function BarMitzvahLandingFields() {
  return (
    <>
      <Card
        title="הדף"
        hint={`דף נפרד, בלי התפריט והתחתית של האתר, לפרסום ולשיתוף. הכתובת: hafakathamerav.co.il${ADDRESS}`}
      >
        <a
          href={ADDRESS}
          target="_blank"
          rel="noopener"
          className="admin-btn self-start no-underline"
        >
          צפייה בדף (נפתח בכרטיסייה חדשה)
        </a>
        <p className="admin-note">
          כדי שכרטיס השירות בדף הבית יוביל לכאן: בלשונית 'שירותים', בכרטיס של קליפים לבר ובת מצווה,
          בוחרים 'דף אחר' וכותבים <span dir="ltr">{ADDRESS}</span>
        </p>
        <LandingSearchFields />
      </Card>

      <Card title="1. פתיח">
        <Lines path="hero.title" label="כותרת" />
        <Text path="hero.lead" label="פסקה" multiline />
        <Text path="hero.leadAccent" label="משפט מודגש בסוף הפסקה" />
        <Text path="hero.cta" label="טקסט הכפתור" hint="מוביל לטופס בתחתית הדף" />
        <Text path="hero.clipsLink" label="הקישור לקליפים" hint="מוביל לקליפים לדוגמה" />
        <h3 className="text-[15px] font-medium text-ink">הקליפ הגדול מתחת לפתיח</h3>
        <ClipFields path="hero.video" />
      </Card>

      <Card title="2. הרעיון">
        <Text path="idea.title" label="כותרת" />
        <Text path="idea.question" label="משפט מודגש" />
        <Lines path="idea.text" label="פסקה" max={6} />
      </Card>

      <Card title="3. קליפים לדוגמה" hint={CONSENT}>
        <Text path="clips.title" label="כותרת" />
        <Text path="clips.lead" label="פסקה" multiline />
        <List<Video>
          path="clips.items"
          itemTitle={(i, v) => `${i + 1}. ${v.title || "סרטון"}`}
          grid
          editable={{ min: 0, max: 12, create: newClip, addLabel: "הוספת סרטון" }}
        >
          {(p) => <ClipFields path={p} />}
        </List>
        <Text path="clips.cta" label="טקסט הכפתור" hint="מוביל לטופס בתחתית הדף" />
      </Card>

      <Card title="4. שאלות" hint="כל שאלה מוצגת כמו בצ'אט: השאלה, ואחריה התשובה של מרב">
        <Lines path="worries.title" label="כותרת" />
        <List<LandingQuestion>
          path="worries.items"
          itemTitle={(i) => `שאלה ${i + 1}`}
          grid
          editable={{
            min: 0,
            max: 8,
            create: () => ({ q: "", a: "" }),
            addLabel: "הוספת שאלה",
          }}
        >
          {(p) => (
            <>
              <Text path={`${p}.q`} label="השאלה" multiline rows={2} />
              <Text path={`${p}.a`} label="התשובה" multiline rows={4} />
            </>
          )}
        </List>
      </Card>

      <Card title="5. סיפור של קליפ" hint={CONSENT}>
        <Text path="story.caption" label="תווית קטנה מעל הכותרת" />
        <Text path="story.title" label="כותרת" />
        <Lines path="story.body" label="טקסט" max={6} rows={10} hint={PARAGRAPHS(6)} />
        <h3 className="text-[15px] font-medium text-ink">פס התמונות (עד 5, ברוחב הדף)</h3>
        <List<Photo>
          path="story.photos"
          itemTitle={(i) => `תמונה ${i + 1}`}
          grid
          editable={{ min: 0, max: 5 }}
        >
          {(p) => <PhotoInput path={p} label="תמונה" aspect="3 / 2" />}
        </List>
        <AddPhotoButton<Photo>
          path="story.photos"
          max={5}
          make={({ name }) => ({ name, alt: "" })}
        />
        <h3 className="text-[15px] font-medium text-ink">הכפתור לקליפ המלא</h3>
        <Text path="story.cta" label="טקסט הכפתור" hint="בלי טקסט או בלי סרטון, הכפתור לא מוצג" />
        <Text path="story.video.title" label="שם הסרטון" hint="מוצג מעל הנגן" />
        <YouTubeInput path="story.video.youtubeId" />
      </Card>

      <Card title="6. גם הדרך היא חלק מהחוויה">
        <Text path="experience.kicker" label="שורה מודגשת מעל הכותרת" />
        <Text path="experience.title" label="כותרת" />
        <Text path="experience.lead" label="משפט מודגש" />
        <Text path="experience.text" label="פסקה" multiline />
        <Text path="experience.closing" label="משפט הסיום" multiline rows={2} />
        <Text path="experience.cta" label="טקסט הכפתור" hint="מוביל לטופס בתחתית הדף" />
      </Card>

      <Card
        title="7. המלצות"
        hint="רק המלצות אמיתיות, באישור הלקוחות לפרסם אותן (בצילומי מסך: מטשטשים שם, מספר ותמונת פרופיל)"
      >
        <Toggle
          path="testimonials.hidden"
          label="הסתרת אזור ההמלצות"
          hint="האזור לא יוצג בדף. מה שכתוב כאן נשמר, ומופיע שוב כשמבטלים את הסימון ושומרים"
        />
        <Text path="testimonials.title" label="כותרת" />
        <Text
          path="testimonials.quote"
          label="ההמלצה המודגשת"
          hint="בלי מירכאות: הן נוספות לבד באתר"
          multiline
        />
        <Text path="testimonials.author" label="שם" hint="בלי שם, השורה לא מוצגת" />
        <h3 className="text-[15px] font-medium text-ink">צילומי מסך של המלצות (עד 15)</h3>
        <List<Shot>
          path="testimonials.shots"
          itemTitle={(i) => `צילום מסך ${i + 1}`}
          grid
          editable={{ min: 0, max: 15 }}
        >
          {(p) => <ShotInput path={p} />}
        </List>
        <AddPhotoButton<Photo>
          path="testimonials.shots"
          max={15}
          label="הוספת צילום מסך"
          make={({ name, ratio }) => ({ name, alt: "", ratio })}
        />
      </Card>

      <Card title="8. התהליך" hint="המספרים (01, 02...) נוספים לבד, לפי הסדר">
        <Text path="process.title" label="כותרת" />
        <Text path="process.lead" label="משפט מודגש" />
        <List<LandingStep>
          path="process.steps"
          itemTitle={(i, s) => `${i + 1}. ${s.title || "שלב"}`}
          grid
          editable={{
            min: 1,
            max: 6,
            create: () => ({ title: "", text: "" }),
            addLabel: "הוספת שלב",
          }}
        >
          {(p, i) => (
            <>
              <StepIconPreview name={stepIcon(i)} />
              <Text path={`${p}.title`} label="שם השלב" />
              <Text path={`${p}.text`} label="תיאור" multiline />
            </>
          )}
        </List>
        <h3 className="text-[15px] font-medium text-ink">הכרטיס האחרון, בסוף הקו</h3>
        <MaskIcon name={FINALE_ICON} size="h-14 w-14" className="text-olive-deep" />
        <Text
          path="process.finale.title"
          label="כותרת"
          hint="כרטיס בצבע שונה, בלי מספר. בלי כותרת, הכרטיס לא מוצג"
        />
        <Text path="process.finale.text" label="טקסט" multiline rows={2} />
        <Toggle
          path="process.finale.noConfetti"
          label="קונפטי כשהכרטיס מופיע"
          inverted
          hint="מבטלים את הסימון ושומרים כדי להפסיק את הקונפטי"
        />
      </Card>

      <Card
        title="9. יצירת קשר"
        hint="הטופס פותח הודעת וואטסאפ מוכנה למרב, כמו הטופס באתר. את נוסח ההודעה עורכים בלשונית 'צור קשר'"
      >
        <Text path="contact.title" label="כותרת" />
        <Lines path="contact.text" label="טקסט" max={4} rows={5} hint={PARAGRAPHS(4)} />
        <Text path="contact.submit" label="טקסט כפתור השליחה" />
        <Text
          path="contact.interest"
          label="הנושא בהודעת הוואטסאפ"
          hint="נכנס להודעה במקום {נושא}, כדי שמרב תדע שהפנייה הגיעה מהדף הזה"
        />
      </Card>

      <Card title="10. נעים להכיר">
        <PhotoInput path="about.photo" label="התמונה של מרב" aspect="3 / 4" />
        <Text path="about.title" label="כותרת" />
        <Text path="about.subtitle" label="משפט מודגש" />
        <Lines path="about.body" label="טקסט" max={6} rows={8} hint={PARAGRAPHS(6)} />
        <Text path="about.link" label="הקישור לאתר" hint="מוביל לדף הבית של האתר" />
      </Card>

      <Card
        title="תחתית הדף"
        hint="הזמנה אחרונה ליצור קשר, ומתחתיה הלוגו, המייל והטלפון (מלשונית 'פרטים והגדרות')"
      >
        <Text path="footer.title" label="כותרת" multiline rows={2} />
        <Text path="footer.button" label="טקסט כפתור הוואטסאפ" />
        <Text
          path="footer.call"
          label="לפני מספר הטלפון"
          hint="מספר הטלפון נוסף אחרי הטקסט, כקישור לחיוג"
        />
      </Card>
    </>
  );
}
