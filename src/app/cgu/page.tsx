export const metadata = {
  title: "Conditions Générales d'Utilisation — SeneDoc",
  description: "Conditions Générales d'Utilisation de SeneDoc",
};

export default function CguPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px 80px", lineHeight: 1.6, color: "#1a1a1a" }}>
      <h1 style={{ color: "#0EA5A4", fontSize: 28, borderBottom: "3px solid #0EA5A4", paddingBottom: 12 }}>
        Conditions Générales d&apos;Utilisation — SeneDoc
      </h1>
      <p style={{ color: "#666", fontStyle: "italic" }}>Dernière mise à jour : 14 juillet 2026</p>

      <h2 style={sectionStyle}>1. Objet</h2>
      <p>
        Les présentes Conditions Générales d&apos;Utilisation (« CGU ») régissent l&apos;accès et l&apos;utilisation
        du site senedoc.net et de l&apos;application mobile SeneDoc (ensemble, « la Plateforme »), édités par :
      </p>
      <p>
        <strong>Apps 1 Global SAU</strong>, société au capital de 10 000 000 F CFA, RCCM SN DKR 2023 B 16270, dont le
        siège social est situé à Jaxaay 1, unité 23, Villa 243, Région de Dakar, Sénégal (« SeneDoc », « nous »).
      </p>
      <p>
        L&apos;utilisation de la Plateforme implique l&apos;acceptation pleine et entière des présentes CGU par toute
        personne y accédant (« l&apos;Utilisateur », « vous »), qu&apos;elle soit Patient ou Médecin.
      </p>

      <h2 style={sectionStyle}>2. Définitions</h2>
      <ul>
        <li><strong>Patient</strong> : Utilisateur inscrit dans le but de rechercher un professionnel de santé et/ou de prendre rendez-vous.</li>
        <li><strong>Médecin</strong> : Utilisateur professionnel de santé inscrit pour proposer ses services et gérer ses rendez-vous.</li>
        <li><strong>Compte</strong> : espace personnel protégé par un numéro de téléphone vérifié et un code PIN (ou email/mot de passe pour les administrateurs).</li>
        <li><strong>Rendez-vous</strong> : créneau de consultation réservé par un Patient auprès d&apos;un Médecin via la Plateforme.</li>
      </ul>

      <h2 style={sectionStyle}>3. Description du service</h2>
      <p>
        <strong>SeneDoc est un service de mise en relation entre Patients et Médecins.</strong> Notre rôle se limite
        strictement à permettre la recherche d&apos;un Médecin, la prise et la gestion de Rendez-vous.
      </p>
      <p>
        <strong>
          SeneDoc n&apos;est pas un professionnel de santé, ne dispense aucun soin, ne pose aucun diagnostic, et
          n&apos;intervient à aucun moment dans la relation de soin entre le Patient et le Médecin.
        </strong>{" "}
        Le contenu de la consultation relève exclusivement de la relation entre le Patient et le Médecin, et ne
        transite à aucun moment par la Plateforme (voir notre{" "}
        <a href="/confidentialite" style={{ color: "#0EA5A4" }}>Politique de confidentialité</a>).
      </p>

      <h2 style={sectionStyle}>4. Inscription et compte utilisateur</h2>
      <h3>4.1 Inscription Patient</h3>
      <p>
        L&apos;inscription se fait par numéro de téléphone, vérifié par SMS, suivi de la création d&apos;un code PIN
        à 4 chiffres qui sert ensuite à la connexion.
      </p>
      <h3>4.2 Inscription Médecin</h3>
      <p>
        En plus des informations ci-dessus : spécialité, numéro d&apos;inscription à l&apos;Ordre, années
        d&apos;expérience. <strong>Le compte Médecin n&apos;est activé et visible des Patients qu&apos;après
        validation par un administrateur SeneDoc</strong>, destinée à vérifier la réalité du statut professionnel
        déclaré. SeneDoc se réserve le droit de refuser ou suspendre tout compte dont les informations ne peuvent
        être vérifiées.
      </p>
      <h3>4.3 Âge minimum</h3>
      <p>
        La Plateforme est réservée aux personnes âgées de 18 ans et plus. Un Patient mineur ne peut être inscrit et
        accompagné que par un parent ou tuteur légal.
      </p>
      <h3>4.4 Sécurité du compte</h3>
      <p>
        Vous êtes seul responsable de la confidentialité de votre code PIN et de toute activité effectuée depuis
        votre compte. Contactez-nous immédiatement à doctafrik@gmail.com en cas de suspicion d&apos;accès non
        autorisé.
      </p>

      <h2 style={sectionStyle}>5. Prise de rendez-vous</h2>
      <p>
        La prise d&apos;un Rendez-vous constitue un engagement entre le Patient et le Médecin concerné.{" "}
        <strong>SeneDoc n&apos;est pas partie à cet engagement</strong> : nous fournissons l&apos;outil de mise en
        relation et de gestion du calendrier, mais la tenue effective du Rendez-vous relève exclusivement du Patient
        et du Médecin.
      </p>

      <h2 style={sectionStyle}>6. Obligations de l&apos;utilisateur</h2>
      <ul>
        <li>Fournir des informations exactes et à jour.</li>
        <li>Ne pas usurper l&apos;identité d&apos;un tiers, ni créer de faux profil.</li>
        <li>Utiliser la Plateforme conformément à sa destination.</li>
        <li>Ne pas perturber le fonctionnement de la Plateforme.</li>
      </ul>
      <p>
        Les Médecins s&apos;engagent en outre à respecter les règles déontologiques de leur profession,
        indépendamment de leur usage de la Plateforme.
      </p>

      <h2 style={sectionStyle}>7. Contenus publiés (blog)</h2>
      <p>
        Les articles et commentaires publiés sont soumis à modération avant publication. SeneDoc se réserve le droit
        de refuser, modifier, ou retirer tout contenu contraire à la loi, aux bonnes mœurs, ou aux présentes CGU.
      </p>

      <h2 style={sectionStyle}>8. Limitation de responsabilité</h2>
      <p><strong>SeneDoc n&apos;est pas responsable :</strong></p>
      <ul>
        <li>des actes médicaux, diagnostics, traitements, ou de la qualité des soins dispensés par les Médecins ;</li>
        <li>des relations contractuelles entre un Patient et un Médecin, y compris en cas d&apos;annulation ou de litige relatif au Rendez-vous ;</li>
        <li>de l&apos;exactitude des informations professionnelles déclarées par les Médecins, au-delà des vérifications raisonnables effectuées ;</li>
        <li>des interruptions temporaires de service liées à la maintenance ou à des causes hors de notre contrôle.</li>
      </ul>
      <p>
        La responsabilité de SeneDoc, si elle devait être engagée, est limitée aux dommages directs et prévisibles
        résultant d&apos;un manquement avéré à ses propres obligations de mise en relation technique.
      </p>

      <h2 style={sectionStyle}>9. Propriété intellectuelle</h2>
      <p>
        La marque SeneDoc, le contenu du site et de l&apos;application (hors contenus publiés par les Utilisateurs),
        ainsi que le code source, sont la propriété exclusive d&apos;Apps 1 Global SAU.
      </p>

      <h2 style={sectionStyle}>10. Protection des données personnelles</h2>
      <p>
        Le traitement de vos données personnelles est décrit dans notre{" "}
        <a href="/confidentialite" style={{ color: "#0EA5A4" }}>Politique de confidentialité</a>, qui fait partie
        intégrante des présentes CGU.
      </p>

      <h2 style={sectionStyle}>11. Résiliation</h2>
      <p>
        Vous pouvez supprimer votre compte à tout moment en nous contactant à doctafrik@gmail.com. SeneDoc peut
        suspendre ou résilier un compte en cas de manquement aux présentes CGU.
      </p>

      <h2 style={sectionStyle}>12. Modification des CGU</h2>
      <p>
        SeneDoc peut modifier les présentes CGU à tout moment. En cas de modification substantielle, les Utilisateurs
        en seront informés via l&apos;application ou par SMS.
      </p>

      <h2 style={sectionStyle}>13. Droit applicable et litiges</h2>
      <p>
        Les présentes CGU sont soumises au droit sénégalais. Tout litige relève de la compétence exclusive des
        tribunaux de Dakar, Sénégal.
      </p>

      <h2 style={sectionStyle}>14. Contact</h2>
      <p>Pour toute question relative aux présentes CGU : doctafrik@gmail.com — +221 77 157 36 23</p>
    </main>
  );
}

const sectionStyle = { color: "#0EA5A4", fontSize: 20, marginTop: 36 };
