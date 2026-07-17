"use client";

import { useEffect, useRef, useState } from "react";
import { DoctorLayout } from "@/components/DoctorLayout";
import { doctorPortal, uploadPhoto, auth } from "@/lib/api";

type DoctorMe = {
  bio: string | null;
  consultationFee: number | null;
  teleconsultationFee: number | null;
  consultationDuration: number | null;
  teleconsultation: boolean;
  acceptNewPatients: boolean;
  yearsExperience: number | null;
  languages: string | null;
  officePhone: string | null;
  whatsappNumber: string | null;
  acceptWhatsapp: boolean;
  website: string | null;
  linkedinUrl: string | null;
  user: { photoUrl: string | null; phoneVerified: boolean };
};

export default function ProfilMedecin() {
  const [doctor, setDoctor] = useState<DoctorMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [bio, setBio] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [teleconsultationFee, setTeleconsultationFee] = useState("");
  const [consultationDuration, setConsultationDuration] = useState("30");
  const [teleconsultation, setTeleconsultation] = useState(false);
  const [acceptNewPatients, setAcceptNewPatients] = useState(true);
  const [yearsExperience, setYearsExperience] = useState("");
  const [languages, setLanguages] = useState("");
  const [officePhone, setOfficePhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [acceptWhatsapp, setAcceptWhatsapp] = useState(false);
  const [website, setWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPinForm, setShowPinForm] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    doctorPortal.getMe().then((d: any) => {
      setDoctor(d);
      setBio(d.bio ?? "");
      setConsultationFee(d.consultationFee != null ? String(d.consultationFee) : "");
      setTeleconsultationFee(d.teleconsultationFee != null ? String(d.teleconsultationFee) : "");
      setConsultationDuration(d.consultationDuration != null ? String(d.consultationDuration) : "30");
      setTeleconsultation(!!d.teleconsultation);
      setAcceptNewPatients(d.acceptNewPatients ?? true);
      setYearsExperience(d.yearsExperience != null ? String(d.yearsExperience) : "");
      setLanguages(d.languages ?? "");
      setOfficePhone(d.officePhone ?? "");
      setWhatsappNumber(d.whatsappNumber ?? "");
      setAcceptWhatsapp(!!d.acceptWhatsapp);
      setWebsite(d.website ?? "");
      setLinkedinUrl(d.linkedinUrl ?? "");
      setPhotoUrl(d.user?.photoUrl ?? null);
    }).finally(() => setLoading(false));
  }, []);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await uploadPhoto(file);
      setPhotoUrl(res.photoUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await doctorPortal.updateProfile({
        bio: bio || undefined,
        consultationFee: consultationFee ? Number(consultationFee) : undefined,
        teleconsultationFee: teleconsultationFee ? Number(teleconsultationFee) : undefined,
        consultationDuration: consultationDuration ? Number(consultationDuration) : undefined,
        teleconsultation,
        acceptNewPatients,
        yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
        languages: languages || undefined,
        officePhone: officePhone || undefined,
        whatsappNumber: whatsappNumber || undefined,
        acceptWhatsapp,
        website: website || undefined,
        linkedinUrl: linkedinUrl || undefined,
      });
      setSaved(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function submitNewPin(e: React.FormEvent) {
    e.preventDefault();
    setPinError("");
    setPinMessage("");
    if (newPin.length !== 4) {
      setPinError("Le PIN contient 4 chiffres.");
      return;
    }
    if (newPin !== newPinConfirm) {
      setPinError("Les deux PIN ne correspondent pas.");
      return;
    }
    setPinLoading(true);
    try {
      await auth.setPin({ pin: newPin });
      setPinMessage("PIN mis à jour avec succès.");
      setNewPin("");
      setNewPinConfirm("");
      setShowPinForm(false);
    } catch (err: any) {
      setPinError(err.message);
    } finally {
      setPinLoading(false);
    }
  }

  if (loading) {
    return (
      <DoctorLayout>
        <p className="text-gray-400">Chargement…</p>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <h1 className="font-display text-2xl font-semibold mb-6">Mon profil</h1>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt="Photo de profil" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">?</div>
          )}
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-sm border border-gray-200 px-4 py-2 rounded-lg font-medium hover:border-teal transition-colors disabled:opacity-50"
          >
            {uploading ? "Envoi…" : "Changer la photo"}
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-sm"
          />
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-4">
          <p className="text-sm font-medium">Consultation en présentiel</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tarif (FCFA)</label>
              <input type="number" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Durée (min)</label>
              <input type="number" value={consultationDuration} onChange={(e) => setConsultationDuration(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-4">
          <Toggle label="Propose la téléconsultation" checked={teleconsultation} onChange={setTeleconsultation} />
          {teleconsultation && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tarif téléconsultation (FCFA)</label>
              <input type="number" value={teleconsultationFee} onChange={(e) => setTeleconsultationFee(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-sm" />
              <p className="text-xs text-gray-400 mt-1">
                N'oubliez pas d'ajouter des créneaux de type "Téléconsultation" dans Mes disponibilités.
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Années d'expérience</label>
          <input type="number" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Langues parlées</label>
          <input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Français, Wolof…" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Téléphone du cabinet</label>
            <input value={officePhone} onChange={(e) => setOfficePhone(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp</label>
            <input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Site web</label>
          <input value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">LinkedIn</label>
          <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-sm" />
        </div>

        <div className="space-y-2 pt-2">
          <Toggle label="Accepte de nouveaux patients" checked={acceptNewPatients} onChange={setAcceptNewPatients} />
          <Toggle label="Accepte d'être contacté par WhatsApp" checked={acceptWhatsapp} onChange={setAcceptWhatsapp} />
        </div>

        {error && <p className="text-sm text-coral">{error}</p>}
        {saved && <p className="text-sm text-teal-dark">Profil mis à jour avec succès.</p>}

        <button type="submit" disabled={saving} className="bg-teal text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60">
          {saving ? "Un instant…" : "Enregistrer"}
        </button>
      </form>

      <section className="mt-10 max-w-xl">
        <h2 className="font-display text-xl font-semibold mb-4">Sécurité</h2>
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          {!showPinForm ? (
            <button onClick={() => { setShowPinForm(true); setPinMessage(""); setPinError(""); }} className="text-sm text-teal font-medium">
              {doctor?.user.phoneVerified ? "Changer mon code PIN" : "Définir un code PIN"}
            </button>
          ) : (
            <form onSubmit={submitNewPin} className="space-y-4 max-w-sm">
              {!doctor?.user.phoneVerified && (
                <p className="text-xs text-gray-500">
                  Votre téléphone n'est pas encore vérifié — définir un PIN activera la connexion par téléphone + PIN.
                </p>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Nouveau PIN</label>
                <input inputMode="numeric" maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} className="w-full text-center text-2xl tracking-[0.5em] font-mono border border-gray-200 rounded-lg px-3 py-3 outline-none focus:border-teal" placeholder="••••" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirmez le nouveau PIN</label>
                <input inputMode="numeric" maxLength={4} value={newPinConfirm} onChange={(e) => setNewPinConfirm(e.target.value.replace(/\D/g, ""))} className="w-full text-center text-2xl tracking-[0.5em] font-mono border border-gray-200 rounded-lg px-3 py-3 outline-none focus:border-teal" placeholder="••••" />
              </div>
              {pinError && <p className="text-sm text-coral">{pinError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={pinLoading} className="bg-teal text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60">
                  {pinLoading ? "Un instant…" : "Enregistrer"}
                </button>
                <button type="button" onClick={() => { setShowPinForm(false); setNewPin(""); setNewPinConfirm(""); setPinError(""); }} className="text-sm text-gray-500">
                  Annuler
                </button>
              </div>
            </form>
          )}
          {pinMessage && <p className="text-sm text-teal-dark mt-3">{pinMessage}</p>}
        </div>
      </section>
    </DoctorLayout>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-teal" />
      {label}
    </label>
  );
}
