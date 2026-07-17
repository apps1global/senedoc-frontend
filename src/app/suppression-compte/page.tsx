export const metadata = {
  title: "Suppression de compte — SeneDoc",
  description: "Comment demander la suppression de votre compte SeneDoc",
};

export default function SuppressionComptePage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px 80px", lineHeight: 1.6, color: "#1a1a1a" }}>
      <h1 style={{ color: "#0EA5A4", fontSize: 28, borderBottom: "3px solid #0EA5A4", paddingBottom: 12 }}>
        Suppression de compte
      </h1>
      <p style={{ color: "#666", fontStyle: "italic" }}>Dernière mise à jour : 14 juillet 2026</p>

      <h2 style={sectionStyle}>Comment demander la suppression de votre compte</h2>
      <p>
        Pour demander la suppression de votre compte SeneDoc (patient ou médecin) et des données associées, envoyez
        un email à <a href="mailto:doctafrik@gmail.com" style={{ color: "#0EA5A4" }}>doctafrik@gmail.com</a> depuis
        l&apos;adresse email associée à votre compte (ou en précisant votre numéro de téléphone d&apos;inscription),
        avec pour objet : « Demande de suppression de compte ».
      </p>
      <p>
        Votre demande sera traitée sous <strong>7 jours ouvrés</strong>.
      </p>

      <h2 style={sectionStyle}>Ce qui est supprimé</h2>
      <ul>
        <li>Vos informations personnelles : nom, prénom, numéro de téléphone, email, code PIN.</li>
        <li>Votre profil (informations professionnelles pour les médecins : spécialité, numéro d&apos;inscription à l&apos;Ordre, biographie).</li>
        <li>Le lien entre votre compte et votre identifiant d&apos;appareil (notifications push).</li>
      </ul>

      <h2 style={sectionStyle}>Ce qui peut être conservé temporairement</h2>
      <p>
        Conformément à notre{" "}
        <a href="/confidentialite" style={{ color: "#0EA5A4" }}>Politique de confidentialité</a>, certaines données
        peuvent être conservées jusqu&apos;à 12 mois après la suppression de votre compte, uniquement lorsque la loi
        l&apos;exige (par exemple, à des fins de lutte contre la fraude), avant suppression ou anonymisation
        définitive.
      </p>
      <p>
        L&apos;historique des rendez-vous déjà pris (date et médecin, sans contenu médical associé) peut être
        conservé de manière anonymisée à des fins statistiques.
      </p>

      <h2 style={sectionStyle}>Contact</h2>
      <p>Pour toute question : doctafrik@gmail.com — +221 77 157 36 23</p>
    </main>
  );
}

const sectionStyle = { color: "#0EA5A4", fontSize: 20, marginTop: 36 };
