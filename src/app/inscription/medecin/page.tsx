"use client";

import { useState } from "react";
import Link from "next/link";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Logo } from "@/components/Logo";
import { apiFetch, auth } from "@/lib/api";
import { SPECIALTIES } from "@/lib/specialties";
import { FacilityPlaceSearch, type SelectedPlace } from "@/components/FacilityPlaceSearch";

type Step = "form" | "otp" | "pin" | "done";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type FacilityDraft = {
  id: string;
  place: SelectedPlace | null;
};

function emptyFacility(): FacilityDraft {
  return { id: Math.random().toString(36).slice(2), place: null };
}

export default function InscriptionMedecin() {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [specialiteAutre, setSpecialiteAutre] = useState("");
  const [numeroOrdre, setNumeroOrdre] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [facilities, setFacilities] = useState<FacilityDraft[]>([emptyFacility()]);

  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [acceptCGU, setAcceptCGU] = useState(false);

  const finalSpecialite = specialite === "Autre" ? specialiteAutre.trim() : specialite;

  function setFacilityPlace(id: string, place: SelectedPlace) {
    setFacilities((prev) => prev.map((f) => (f.id === id ? { ...f, place } : f)));
  }

  function clearFacilityPlace(id: string) {
    setFacilities((prev) => prev.map((f) => (f.id === id ? { ...f, place: null } : f)));
  }

  function addFacility() {
    setFacilities((prev) => [...prev, emptyFacility()]);
  }

  function removeFacility(id: string) {
    setFacilities((prev) => (prev.length > 1 ? prev.filter((f) => f.id !== id) : prev));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName || !lastName || !phone || !finalSpecialite || !numeroOrdre) {
      setError("Merci de remplir les champs obligatoires.");
      return;
    }
    if (facilities.some((f) => !f.place)) {
      setError("Sélectionnez chaque établissement dans la liste Google Maps proposée.");
      return;
    }
    setLoading(true);
    try {
      const res: any = await apiFetch("/auth/register-doctor", {
        method: "POST",
        auth: false,
        body: {
          firstName, lastName, phone,
          specialite: finalSpecialite, numeroOrdre,
          referralCode: referralCode || undefined,
          email: email.trim() || undefined,
          password: password || undefined,
          facilities: facilities.map((f) => ({
            name: f.place!.name,
            address: f.place!.address || undefined,
            city: f.place!.city || undefined,
            country: "Sénégal",
            latitude: f.place!.latitude,
            longitude: f.place!.longitude,
            googlePlaceId: f.place!.googlePlaceId,
          })),
        },
      });
      setUserId(res.id);
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("Le code contient 6 chiffres.");
      return;
    }
    setLoading(true);
    try {
      await auth.verifyOtp({ userId, otp });
      setStep("pin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitPin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (pin.length !== 4) {
      setError("Le PIN contient 4 chiffres.");
      return;
    }
    if (pin !== pinConfirm) {
      setError("Les deux PIN ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await auth.setPin({ pin });
      window.localStorage.setItem("senedoc_medecin_phone", phone);
      setStep("done");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <div className="min-h-screen bg-teal-light flex flex-col">
        <div className="p-6"><Link href="/"><Logo /></Link></div>
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
            <h1 className="font-display text-2xl font-semibold mb-3">Inscription reçue</h1>
            <p className="text-gray-600 leading-relaxed">
              Votre demande est en cours de validation. Un administrateur vérifie
              votre inscription à l'Ordre. Vous serez visible aux patients une fois validé.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              Vous pouvez dès maintenant accéder à votre espace médecin avec votre
              téléphone et le code PIN que vous venez de définir.
            </p>
            <Link href="/espace-medecin/connexion" className="inline-block mt-6 text-teal font-medium">Accéder à mon espace</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-light flex flex-col">
      <div className="p-6"><Link href="/"><Logo /></Link></div>
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-8">

          {step === "form" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-1">Créer mon compte médecin</h1>
              <p className="text-sm text-gray-500 mb-6">Rejoignez SeneDoc et gérez vos rendez-vous en ligne.</p>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <F label="Prénom *" value={firstName} onChange={setFirstName} />
                  <F label="Nom *" value={lastName} onChange={setLastName} />
                </div>
                <F label="Téléphone *" value={phone} onChange={setPhone} placeholder="+221 77 123 45 67" />
                <div>
                  <label className="block text-sm font-medium mb-1">Spécialité *</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal"
                    value={specialite}
                    onChange={(e) => setSpecialite(e.target.value)}
                  >
                    <option value="">Choisir une spécialité</option>
                    {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {specialite === "Autre" && (
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal mt-2"
                      value={specialiteAutre}
                      onChange={(e) => setSpecialiteAutre(e.target.value)}
                      placeholder="Précisez votre spécialité"
                    />
                  )}
                </div>
                <F label="Numéro à l'Ordre *" value={numeroOrdre} onChange={setNumeroOrdre} />
                <F label="Code de parrainage (facultatif)" value={referralCode} onChange={setReferralCode} placeholder="Si un administrateur vous en a donné un" />

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">
                    Facultatif — utile si votre téléphone est temporairement injoignable, ou pour recevoir des informations importantes.
                  </p>
                  <div className="space-y-3">
                    <F label="Email (facultatif)" value={email} onChange={setEmail} placeholder="vous@exemple.com" type="email" />
                    <F label="Mot de passe (facultatif)" value={password} onChange={setPassword} placeholder="Au moins 8 caractères" type="password" />
                  </div>
                </div>

                <div className="pt-2">
                  <h2 className="font-medium mb-1">Mes établissements</h2>
                  <p className="text-xs text-gray-500 mb-3">
                    Recherchez et sélectionnez votre établissement tel qu'il apparaît sur Google Maps.
                  </p>

                  {API_KEY ? (
                    <APIProvider apiKey={API_KEY} libraries={["places"]}>
                      {facilities.map((f, index) => (
                        <div key={f.id} className="bg-gray-50 rounded-xl p-4 mb-3">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium">Établissement {index + 1}</p>
                            {facilities.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeFacility(f.id)}
                                className="text-xs text-coral font-medium"
                              >
                                Retirer
                              </button>
                            )}
                          </div>
                          <FacilityPlaceSearch
                            selected={f.place}
                            onSelect={(place) => setFacilityPlace(f.id, place)}
                            onClear={() => clearFacilityPlace(f.id)}
                          />
                        </div>
                      ))}
                    </APIProvider>
                  ) : (
                    <p className="text-sm text-coral">
                      Clé Google Maps manquante (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={addFacility}
                    className="w-full border border-dashed border-teal text-teal text-sm font-medium py-2.5 rounded-lg hover:bg-teal-light transition-colors"
                  >
                    + Ajouter un autre établissement
                  </button>
                </div>

                {error && <p className="text-sm text-coral">{error}</p>}
                <label className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptCGU}
                    onChange={(e) => setAcceptCGU(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-teal cursor-pointer"
                  />
                  <span>
                    J&apos;accepte les{" "}
                    <Link href="/cgu" target="_blank" className="text-teal font-medium underline">conditions d&apos;utilisation</Link>{" "}
                    et la{" "}
                    <Link href="/confidentialite" target="_blank" className="text-teal font-medium underline">politique de confidentialité</Link>.
                  </span>
                </label>
                <button type="submit" disabled={loading || !acceptCGU} className="w-full bg-teal text-white py-3 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60">
                  {loading ? "Un instant…" : "M'inscrire"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-1">Vérifiez votre téléphone</h1>
              <p className="text-sm text-gray-500 mb-6">Nous avons envoyé un code à 6 chiffres au {phone}.</p>
              <form onSubmit={submitOtp} className="space-y-4">
                <CodeInput value={otp} onChange={setOtp} length={6} />
                {error && <p className="text-sm text-coral">{error}</p>}
                <Submit loading={loading}>Vérifier</Submit>
              </form>
            </>
          )}

          {step === "pin" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-1">Créez votre code PIN</h1>
              <p className="text-sm text-gray-500 mb-6">4 chiffres pour vous reconnecter facilement à votre espace médecin.</p>
              <form onSubmit={submitPin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Votre PIN</label>
                  <CodeInput value={pin} onChange={setPin} length={4} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirmez le PIN</label>
                  <CodeInput value={pinConfirm} onChange={setPinConfirm} length={4} />
                </div>
                {error && <p className="text-sm text-coral">{error}</p>}
                <Submit loading={loading}>Terminer</Submit>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function F({ label, value, onChange, placeholder, type }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type || "text"} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function CodeInput({ value, onChange, length }: { value: string; onChange: (v: string) => void; length: number }) {
  return (
    <input
      inputMode="numeric"
      maxLength={length}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      className="w-full text-center text-2xl tracking-[0.5em] font-mono border border-gray-200 rounded-lg px-3 py-3 outline-none focus:border-teal"
      placeholder={"•".repeat(length)}
    />
  );
}

function Submit({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading} className="w-full bg-teal text-white py-3 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60">
      {loading ? "Un instant…" : children}
    </button>
  );
}
