export const metadata = {
  title: "Politique de confidentialité — SeneDoc",
  description: "Politique de confidentialité de SeneDoc",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px 80px", lineHeight: 1.6, color: "#1a1a1a" }}>
      <h1 style={{ color: "#0EA5A4", fontSize: 28, borderBottom: "3px solid #0EA5A4", paddingBottom: 12 }}>
        Politique de confidentialité — SeneDoc
      </h1>
      <p style={{ color: "#666", fontStyle: "italic" }}>Dernière mise à jour : 14 juillet 2026</p>

      <h2 style={sectionStyle}>1. Qui sommes-nous</h2>
      <p>
        SeneDoc est une plateforme de <strong>mise en relation</strong> entre patients et professionnels de santé au
        Sénégal, accessible via le site senedoc.net et l&apos;application mobile SeneDoc.
      </p>
      <p>
        <strong>
          SeneDoc fonctionne comme un standard téléphonique ou un annuaire de rendez-vous : nous connectons les
          patients aux médecins, nous ne participons à aucun moment aux soins eux-mêmes.
        </strong>{" "}
        Concrètement :
      </p>
      <ul>
        <li>Nous ne demandons jamais à un patient de décrire ses symptômes, ses antécédents, ou tout autre motif de consultation.</li>
        <li>Nous ne demandons jamais à un médecin de saisir un diagnostic, une ordonnance, ou toute information clinique sur un patient.</li>
        <li>Notre plateforme ne contient aucun dossier médical. Ce qui se dit entre vous et votre médecin, pendant ou après la consultation, ne transite jamais par SeneDoc.</li>
      </ul>
      <p>Notre rôle s&apos;arrête à : vous aider à trouver un médecin, et vous permettre de prendre rendez-vous avec lui.</p>

      <p>
        <strong>Responsable du traitement :</strong> Apps 1 Global SAU, au capital de 10 000 000 F CFA — RCCM SN DKR
        2023 B 16270
        <br />
        <strong>Contact :</strong> doctafrik@gmail.com — +221 77 157 36 23
        <br />
        <strong>Adresse :</strong> Jaxaay 1, unité 23, Villa 243, Région de Dakar, Sénégal
      </p>

      <h2 style={sectionStyle}>2. Données que nous collectons</h2>

      <h3>2.1 Pour tous les utilisateurs (patients et médecins)</h3>
      <Table
        rows={[
          ["Prénom, nom", "Identification de votre compte"],
          ["Numéro de téléphone", "Création de compte, authentification (SMS), contact"],
          ["Code PIN", "Connexion sécurisée (stocké chiffré, jamais en clair — voir section 5)"],
          ["Code de vérification (OTP)", "Confirmer que le numéro de téléphone vous appartient"],
          ["Adresse IP", "Sécurité (limitation des tentatives de connexion, prévention de la fraude)"],
        ]}
      />

      <h3>2.2 Pour les patients</h3>
      <Table
        rows={[
          ["Région, ville", "Vous proposer des médecins proches de vous"],
          ["Rendez-vous pris (date, médecin)", "Gérer votre agenda de rendez-vous"],
        ]}
      />

      <h3>2.3 Pour les médecins</h3>
      <Table
        rows={[
          ["Email, mot de passe", "Compte médecin (en plus du PIN)"],
          ["Spécialité, numéro d'inscription à l'Ordre", "Vérifier votre statut de médecin avant validation"],
          ["Années d'expérience, biographie, langues", "Afficher votre profil aux patients"],
          ["Tarif, disponibilités", "Permettre la prise de rendez-vous"],
          ["Établissement(s) d'exercice", "Vous rattacher à une clinique/cabinet le cas échéant"],
        ]}
      />

      <h3>2.4 Notifications push (application mobile)</h3>
      <p>
        Si vous autorisez les notifications, nous stockons un identifiant technique de votre appareil (fourni par
        Firebase Cloud Messaging, un service de Google) pour vous envoyer des notifications (ex. rappel de
        rendez-vous). Cet identifiant est uniquement associé à votre compte, sans information personnelle en
        lui-même.
      </p>

      <h3>2.5 Contenus publics (blog)</h3>
      <p>
        Si vous publiez un article (auteurs autorisés) ou un commentaire, ce contenu est visible publiquement sur le
        blog SeneDoc.
      </p>

      <h2 style={sectionStyle}>3. Ce que nous ne collectons JAMAIS</h2>
      <p>
        <strong>SeneDoc ne collecte aucune donnée médicale ou de santé, à aucun moment.</strong> En particulier, nous
        ne recueillons jamais :
      </p>
      <ul>
        <li>vos symptômes ou motifs de consultation,</li>
        <li>vos antécédents médicaux,</li>
        <li>un diagnostic, une ordonnance, ou tout compte-rendu de consultation,</li>
        <li>toute autre information clinique vous concernant.</li>
      </ul>
      <p>
        La seule information liée à un rendez-vous que nous conservons est technique et logistique : la date,
        l&apos;heure, et le médecin concerné — jamais son contenu.
      </p>
      <p>Nous ne partageons ni ne vendons vos données à des fins publicitaires.</p>

      <h2 style={sectionStyle}>4. Avec qui partageons-nous vos données</h2>
      <Table
        rows={[
          ["Twilio (service SMS)", "Numéro de téléphone — envoi du code de vérification"],
          ["Firebase / Google", "Identifiant technique de l'appareil — notifications push"],
          ["Hébergeur du serveur", "Toutes les données — stockage sécurisé"],
        ]}
      />
      <p>Nous ne partageons vos données avec aucune autre entreprise à des fins commerciales.</p>

      <h2 style={sectionStyle}>5. Comment nous protégeons vos données</h2>
      <ul>
        <li>Votre PIN et votre mot de passe (médecins) sont chiffrés (hachage bcrypt) — même notre équipe ne peut pas les lire.</li>
        <li>Les connexions entre l&apos;application et nos serveurs sont chiffrées (HTTPS).</li>
        <li>Sur mobile, votre session est stockée dans l&apos;espace sécurisé de votre téléphone (Keychain iOS / Keystore Android).</li>
        <li>Votre compte est protégé contre les tentatives de connexion abusives (blocage temporaire après plusieurs échecs).</li>
      </ul>

      <h2 style={sectionStyle}>6. Combien de temps conservons-nous vos données</h2>
      <p>
        Nous conservons vos données tant que votre compte reste actif. Si vous supprimez votre compte, vos données
        personnelles sont supprimées ou anonymisées dans un délai de 12 mois, sauf obligation légale de conservation
        plus longue (par exemple en cas de nécessité de lutte contre la fraude).
      </p>

      <h2 style={sectionStyle}>7. Vos droits</h2>
      <p>
        Conformément à la loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère
        personnel, vous disposez d&apos;un droit d&apos;accès, de rectification, et de suppression de vos données.
        Pour exercer ces droits, contactez-nous à doctafrik@gmail.com.
      </p>
      <p>
        Vous pouvez également adresser une réclamation à la Commission de Protection des Données Personnelles (CDP)
        du Sénégal.
      </p>

      <h2 style={sectionStyle}>8. Mineurs</h2>
      <p>
        SeneDoc est accessible aux personnes âgées de 18 ans et plus. Si vous êtes mineur, un parent ou tuteur légal
        doit créer et gérer votre compte, y compris pour la prise de rendez-vous en votre nom.
      </p>

      <h2 style={sectionStyle}>9. Modifications de cette politique</h2>
      <p>
        Nous pouvons mettre à jour cette politique de confidentialité. La date de dernière mise à jour est indiquée
        en haut de cette page. En cas de changement important, nous vous en informerons via l&apos;application ou
        par SMS.
      </p>

      <h2 style={sectionStyle}>10. Contact</h2>
      <p>Pour toute question sur cette politique de confidentialité : doctafrik@gmail.com</p>
    </main>
  );
}

const sectionStyle = { color: "#0EA5A4", fontSize: 20, marginTop: 36 };

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <table style={{ borderCollapse: "collapse", width: "100%", margin: "16px 0" }}>
      <tbody>
        {rows.map(([label, value], i) => (
          <tr key={i}>
            <td style={{ border: "1px solid #e0e0e0", padding: "10px 12px", fontSize: 14, fontWeight: 600, width: "40%" }}>
              {label}
            </td>
            <td style={{ border: "1px solid #e0e0e0", padding: "10px 12px", fontSize: 14 }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
