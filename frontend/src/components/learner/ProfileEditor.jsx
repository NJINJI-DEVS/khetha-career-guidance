// Display name and avatar.
//
// Both ride in the existing profileData jsonb column, so this needed no backend
// change and no migration. The photo is downscaled to 96px and re-encoded as a
// JPEG data URL before it is stored — a full-resolution phone photo would be
// several megabytes in a database column that is fetched on every app load.
//
// A learner on a borrowed phone may not want a photo of themselves stored at
// all, so initials on a colour are the default and the photo is opt-in.

import { useState, useRef } from 'react';
import { Camera, Check, Trash2, User } from 'lucide-react';
import { ModalShell } from '../ui/ModalShell';
import { Avatar, AVATAR_COLORS } from '../ui/Avatar';

const AVATAR_PX = 96;

export { Avatar };

export function ProfileEditor({ name, avatar, onSave, onClose }) {
  const [draftName, setDraftName] = useState(name || "");
  const [color, setColor] = useState(avatar?.color || AVATAR_COLORS[0]);
  const [photo, setPhoto] = useState(avatar?.photo || null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const pickPhoto = (file) => {
    if (!file) return;
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        /* Centre-crop to a square, then downscale — keeps faces centred rather
           than squashing a portrait into a circle. */
        const side = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_PX;
        canvas.height = AVATAR_PX;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(
          img,
          (img.width - side) / 2, (img.height - side) / 2, side, side,
          0, 0, AVATAR_PX, AVATAR_PX
        );
        setPhoto(canvas.toDataURL("image/jpeg", 0.8));
        setBusy(false);
      };
      img.onerror = () => setBusy(false);
      img.src = reader.result;
    };
    reader.onerror = () => setBusy(false);
    reader.readAsDataURL(file);
  };

  const ready = draftName.trim().length > 1;

  return (
    <ModalShell title="Edit your profile" onClose={onClose}>
      <div className="flex flex-col items-center">
        <Avatar name={draftName} avatar={{ color, photo }} size={88} />
        <div className="mt-3 flex gap-2">
          <button onClick={() => fileRef.current?.click()} disabled={busy}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-900 ring-1 ring-slate-200 k-dis-soft">
            <Camera className="h-3.5 w-3.5" />{busy ? "Working…" : photo ? "Change photo" : "Add a photo"}
          </button>
          {photo && (
            <button onClick={() => setPhoto(null)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-semibold k-tx-9B1C14 ring-1 ring-slate-200">
              <Trash2 className="h-3.5 w-3.5" />Remove
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => pickPhoto(e.target.files?.[0])} />
        <p className="mt-2 text-center text-[10px] leading-relaxed text-slate-600">
          Photos stay on your own account and are shrunk to {AVATAR_PX}px before saving. On a shared phone, initials
          are the safer choice.
        </p>
      </div>

      <div className="mt-4">
        <label htmlFor="pe-name" className="text-xs font-medium text-slate-700">Display name</label>
        <input id="pe-name" value={draftName} onChange={(e) => setDraftName(e.target.value.slice(0, 40))}
          placeholder="What should we call you?"
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
        <p className="mt-1 text-[10px] text-slate-600">
          This is what the app calls you. It does not change the legal name on your NSC record.
        </p>
      </div>

      {!photo && (
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-700">Avatar colour</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {AVATAR_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} aria-label={`Colour ${c}`}
                className="grid h-9 w-9 place-items-center rounded-xl ring-2 ring-offset-2"
                style={{ background: c, ringColor: color === c ? c : "transparent",
                         boxShadow: color === c ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : "none" }}>
                {color === c && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => { onSave({ displayName: draftName.trim(), avatar: { color, photo } }); onClose(); }}
        disabled={!ready || busy}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white k-dis">
        <User className="h-4 w-4" />Save profile
      </button>
    </ModalShell>
  );
}
