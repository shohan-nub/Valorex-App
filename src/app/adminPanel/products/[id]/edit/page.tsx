'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'
import { uploadToCloudinary } from '@/app/lib/supabase/cloudinary'

const CATEGORIES = [
  { value: 'top_pick', label: 'Top Pick' },
  { value: 'club', label: 'Club' },
  { value: 'retro', label: 'Retro' },
  { value: 'national', label: 'National' },
]

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const id = params.id as string

  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)

  const [form,setForm]=useState<any>(null)

  const [coverPreview,setCoverPreview]=useState('')
  const [coverFile,setCoverFile]=useState<File|null>(null)

  const [extraImages,setExtraImages]=useState<string[]>([])
  const [newExtra,setNewExtra]=useState<File[]>([])

  useEffect(()=>{
    load()
  },[])

  async function load(){

    const {data,error}=await supabase
    .from('products')
    .select('*')
    .eq('id',id)
    .single()

    if(error){
      alert(error.message)
      return
    }

    setForm(data)

    setCoverPreview(data.image_url||'')

    setExtraImages(data.extra_images||[])

    setLoading(false)

  }

  function setField(name:string,val:any){

    setForm((p:any)=>({
      ...p,
      [name]:val
    }))

  }

  function toggleCategory(cat:string){

    const current=form.categories||[]

    setField(
      'categories',

      current.includes(cat)

      ? current.filter((x:string)=>x!==cat)

      : [...current,cat]
    )

  }

  function toggleSize(size:string){

    const current=form.sizes||[]

    setField(
      'sizes',

      current.includes(size)

      ? current.filter((x:string)=>x!==size)

      : [...current,size]
    )

  }

  async function updateProduct(){

    setSaving(true)

    try{

      let cover=form.image_url

      if(coverFile){

        const up=await uploadToCloudinary(coverFile)

        cover=up.url

      }

      let extras=[...extraImages]

      if(newExtra.length){

        const uploaded=await Promise.all(

          newExtra.map(

            f=>uploadToCloudinary(f)
            .then(r=>r.url)

          )

        )

        extras=[...extras,...uploaded]

      }

      const payload={

        name:form.name,

        description:form.description,

        desc_section1_title:form.desc_section1_title,

        desc_section1_body:form.desc_section1_body,

        desc_section2_title:form.desc_section2_title,

        desc_section2_body:form.desc_section2_body,

        desc_section3_title:form.desc_section3_title,

        desc_section3_body:form.desc_section3_body,

        price:Number(form.price),

        original_price:
        form.original_price
        ? Number(form.original_price)
        : null,

        full_sleeve_extra_price:
        Number(
          form.full_sleeve_extra_price||0
        ),

        stock:Number(form.stock),

        image_url:cover,

        extra_images:extras,

        categories:form.categories,

        category:
        form.categories?.[0]||null,

        sizes:form.sizes

      }

      const {error}=await supabase

      .from('products')

      .update(payload)

      .eq('id',id)

      if(error) throw error

      alert('Updated')

      router.refresh()

    }

    catch(e:any){

      alert(e.message)

    }

    finally{

      setSaving(false)

    }

  }

  if(loading||!form){

    return(
      <div className='p-5'>
        loading...
      </div>
    )

  }

  return(

<div className='max-w-4xl mx-auto p-4 sm:p-6 space-y-6'>

<h1 className='text-2xl font-bold'>
Edit Product
</h1>

<div className='grid gap-4'>

<input
className='border rounded-xl p-3'
value={form.name}
onChange={e=>
setField(
'name',
e.target.value
)}
/>

<div className='grid sm:grid-cols-3 gap-3'>

<input
type='number'
placeholder='sale'
className='border rounded-xl p-3'
value={form.price}
onChange={e=>
setField(
'price',
e.target.value
)}
/>

<input
type='number'
placeholder='original'
className='border rounded-xl p-3'
value={form.original_price||''}
onChange={e=>
setField(
'original_price',
e.target.value
)}
/>

<input
type='number'
placeholder='sleeve extra'
className='border rounded-xl p-3'
value={form.full_sleeve_extra_price||0}
onChange={e=>
setField(
'full_sleeve_extra_price',
e.target.value
)}
/>

</div>

<p className='text-xs text-gray-500'>
0 দিলে sleeve option hide হবে
</p>

<div className='grid sm:grid-cols-2 gap-4'>

<div>

<p className='mb-2'>
Cover
</p>

<label>

<Image
src={coverPreview}
alt=''
width={400}
height={400}
className='rounded-2xl aspect-square object-cover'
/>

<input

hidden

type='file'

accept='image/*'

onChange={e=>{

const f=e.target.files?.[0]

if(!f)return

setCoverFile(f)

setCoverPreview(

URL.createObjectURL(f)

)

}}

/>

</label>

</div>

<div>

<p className='mb-2'>
Gallery
</p>

<div className='grid grid-cols-3 gap-2'>

{extraImages.map((img,i)=>(

<div
key={i}
className='relative'
>

<Image

src={img}

alt=''

width={150}

height={150}

className='aspect-square rounded-xl object-cover'

/>

<div className='absolute top-1 right-1 flex gap-1'>

<button

className='bg-white px-2 rounded'

onClick={()=>{

if(i===0)return

const arr=[...extraImages]

;[arr[i-1],arr[i]]

=[arr[i],arr[i-1]]

setExtraImages(arr)

}}

>

↑

</button>

<button

className='bg-white px-2 rounded'

onClick={()=>{

if(i===extraImages.length-1)return

const arr=[...extraImages]

;[arr[i],arr[i+1]]

=[arr[i+1],arr[i]]

setExtraImages(arr)

}}

>

↓

</button>

<button

className='bg-red-500 text-white px-2 rounded'

onClick={()=>{

setExtraImages(

p=>

p.filter(
(_,x)=>x!==i
)

)

}}

>

×

</button>

</div>

</div>

))}

</div>

<input

multiple

type='file'

accept='image/*'

className='mt-3'

onChange={e=>

setNewExtra(

Array.from(
e.target.files||[]
)

)

}

/>

</div>

</div>

<div className='flex flex-wrap gap-2'>

{CATEGORIES.map(c=>(

<button

key={c.value}

onClick={()=>

toggleCategory(c.value)

}

className={`

px-4 py-2 rounded-xl

${

form.categories?.includes(
c.value
)

?

'bg-green-700 text-white'

:

'border'

}

`}

>

{c.label}

</button>

))}

</div>

<div className='flex flex-wrap gap-2'>

{ALL_SIZES.map(size=>(

<button

key={size}

onClick={()=>toggleSize(size)}

className={`

px-4 py-2 rounded-xl

${

form.sizes?.includes(size)

?

'bg-green-700 text-white'

:

'border'

}

`}

>

{size}

</button>

))}

</div>

<textarea

rows={4}

className='border rounded-xl p-3'

value={form.description||''}

onChange={e=>

setField(
'description',
e.target.value
)

}

/>

<button

onClick={updateProduct}

disabled={saving}

className='bg-[#00612E] text-white rounded-xl p-4'

>

{saving

? 'saving'

: 'update product'

}

</button>

</div>

</div>

)

}