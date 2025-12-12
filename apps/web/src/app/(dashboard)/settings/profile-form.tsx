'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@mentoria/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from './actions'
import { Loader2, CheckCircle2, Camera, Trash2, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPhoneForDisplay, normalizePhoneNumber, phoneNumberSchema } from '@/lib/validations/profile'

interface ProfileFormProps {
  user: User
  profile: Profile | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const inputFileRef = useRef<HTMLInputElement>(null)

  function getInitials() {
    return (
      profile?.full_name?.charAt(0).toUpperCase() ||
      user.email?.charAt(0).toUpperCase()
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function uploadAvatar(file: File): Promise<string|null> {
    // Validação de tamanho (max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('A imagem deve ter no máximo 2MB.');
      return null;
    }

    // Validação de tipo
    if (!file.type.startsWith('image/')) {
      setError('O arquivo deve ser uma imagem (jpg, png, gif, etc).');
      return null;
    }

    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'png';
    // Path: apenas o nome do arquivo dentro do bucket "avatars"
    const fileName = `${user.id}-${Date.now()}.${ext}`;
    
    setUploadLoading(true);
    console.log('[Avatar Upload] Iniciando upload...', { fileName, fileSize: file.size, fileType: file.type });

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('[Avatar Upload] Erro no upload:', error);
      setUploadLoading(false);
      setError(`Erro ao fazer upload: ${error.message}`);
      return null;
    }

    console.log('[Avatar Upload] Upload bem sucedido:', data);

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    console.log('[Avatar Upload] URL pública:', urlData?.publicUrl);
    
    setUploadLoading(false);
    return urlData?.publicUrl || null;
  }

  async function handleRemoveAvatar() {
    // Se só tem preview (ainda não salvou), só limpa o estado
    if (previewUrl && !avatarUrl) {
      setPreviewUrl('');
      setSelectedFile(null);
      return;
    }

    // Remove avatar no Storage e do perfil
    if (avatarUrl) {
      const supabase = createClient();
      // Extrai o nome do arquivo da URL (última parte após /avatars/)
      const parts = avatarUrl.split('/avatars/');
      const fileName = parts[parts.length - 1];
      
      if (fileName) {
        console.log('[Avatar Remove] Removendo arquivo:', fileName);
        const { error } = await supabase.storage.from('avatars').remove([fileName]);
        if (error) {
          console.error('[Avatar Remove] Erro ao remover:', error);
        }
      }
      setAvatarUrl('');
      setPreviewUrl('');
      setSelectedFile(null);
    }
  }

  function validatePhone(phone: string): boolean {
    if (!phone || phone.trim() === '') return true // Empty is valid (optional field)
    
    const result = phoneNumberSchema.safeParse(normalizePhoneNumber(phone))
    if (!result.success) {
      setPhoneError('Telefone deve estar no formato internacional (ex: +5511999998888)')
      return false
    }
    setPhoneError(null)
    return true
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setSuccess(false)
    setError(null)
    setPhoneError(null)

    const formData = new FormData(event.currentTarget)
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phoneNumber') as string
    
    if (!fullName || fullName.length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres')
      setIsLoading(false)
      return
    }

    // Validate phone if provided
    if (phone && !validatePhone(phone)) {
      setIsLoading(false)
      return
    }

    let finalAvatarUrl = avatarUrl
    try {
      // Se usuário selecionou nova imagem, faz upload primeiro
      if (selectedFile) {
        const url = await uploadAvatar(selectedFile)
        if (url) finalAvatarUrl = url
      }
      // Se usuário removeu o avatar
      if (!selectedFile && !avatarUrl && profile?.avatar_url) {
        finalAvatarUrl = ''
      }
      
      const result = await updateProfile({ 
        fullName, 
        avatar_url: finalAvatarUrl,
        phone_number: phone || null
      })
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setAvatarUrl(finalAvatarUrl)
        setPreviewUrl('')
        setSelectedFile(null)
        router.refresh()
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError('Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setIsLoading(false)
      setUploadLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar + botão upload */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          {/* Avatar Circular */}
          {previewUrl || avatarUrl ? (
            <img
              src={previewUrl || avatarUrl}
              alt="Avatar"
              className="h-16 w-16 rounded-full object-cover border-2 border-emerald-200 shadow"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-2xl font-bold select-none">
              {getInitials()}
            </div>
          )}
          {/* Botão upload sobreposto */}
          <label className="absolute bottom-0 right-0 cursor-pointer bg-background/90 border border-border rounded-full shadow p-1 hover:bg-accent h-8 w-8 flex items-center justify-center">
            <Camera className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <input
              type="file"
              accept="image/*"
              ref={inputFileRef}
              className="hidden"
              onChange={handleFileChange}
              disabled={uploadLoading || isLoading}
            />
          </label>
          {(avatarUrl || previewUrl) && (
            <button
              type="button"
              title="Remover foto"
              onClick={handleRemoveAvatar}
              className="absolute -bottom-2 left-0 bg-background/90 border border-border rounded-full p-1 flex items-center hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            </button>
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">{profile?.full_name || 'Usuário'}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Mensagem de sucesso */}
      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Perfil atualizado com sucesso!
        </div>
      )}
      {/* Mensagem de erro */}
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          defaultValue={profile?.full_name || ''}
          placeholder="Seu nome completo"
          disabled={isLoading}
        />
      </div>
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={user.email || ''} disabled className="bg-muted text-foreground" />
        <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
      </div>

      {/* Telefone */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Telefone (WhatsApp)
        </Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          defaultValue={phoneNumber}
          placeholder="+5511999998888"
          disabled={isLoading}
          onChange={(e) => {
            setPhoneNumber(e.target.value)
            if (phoneError) validatePhone(e.target.value)
          }}
          className={phoneError ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {phoneError && (
          <p className="text-xs text-red-500">{phoneError}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Formato internacional para integração com WhatsApp. Ex: +5511999998888
        </p>
      </div>

      {/* Botão salvar */}
      <Button type="submit" disabled={isLoading || uploadLoading}>
        {isLoading || uploadLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar Alterações'
        )}
      </Button>
    </form>
  );
}

