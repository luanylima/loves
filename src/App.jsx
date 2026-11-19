import { useEffect, useMemo, useState } from 'react'
import { collection, addDoc, db, isConfigured, onSnapshot, orderBy, query, serverTimestamp } from './firebase'
import { ArrowDown, ArrowRight, CakeSlice, Clock3, Heart, Menu, Search, Sparkles, X } from 'lucide-react'

const starterRecipes = [
  { id: 'demo-1', name: 'Bolo de morango com chantilly', description: 'Massa fofinha, recheio cremoso e morangos fresquinhos. Um clássico que abraça.', category: 'Bolos', time: 55, ingredients: '3 ovos, 2 xícaras de farinha, 1 xícara de açúcar, morangos, chantilly', method: 'Prepare a massa, asse até dourar, recheie com chantilly e morangos e finalize com carinho.', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85' },
  { id: 'demo-2', name: 'Cupcakes de baunilha', description: 'Pequenos bolinhos macios com cobertura delicada de buttercream.', category: 'Cupcakes', time: 35, ingredients: '2 xícaras de farinha, 2 ovos, baunilha, açúcar, manteiga', method: 'Misture os ingredientes, distribua em forminhas e asse. Cubra com buttercream.', image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=900&q=85' },
  { id: 'demo-3', name: 'Torta de frutas vermelhas', description: 'Uma base amanteigada com creme suave e frutas cheias de cor.', category: 'Tortas', time: 70, ingredients: 'Farinha, manteiga gelada, açúcar, creme de confeiteiro e frutas vermelhas', method: 'Asse a base da torta, recheie com creme frio e decore com frutas frescas.', image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=900&q=85' },
]
const categories = ['Todas', 'Bolos', 'Cupcakes', 'Tortas', 'Doces', 'Biscoitos']
const fallbackImages = {
  Bolos: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85',
  Cupcakes: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=900&q=85',
  Tortas: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=900&q=85',
  Doces: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?auto=format&fit=crop&w=900&q=85',
  Biscoitos: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=85',
}

function RecipeCard({ recipe, index, onOpen }) {
  const image = recipe.image || fallbackImages[recipe.category] || fallbackImages.Bolos
  return (
    <button className="recipe-card" onClick={() => onOpen(recipe)} style={{ '--delay': `${index * 90}ms` }} aria-label={`Ver receita: ${recipe.name}`}>
      <div className="recipe-image-wrap"><img src={image} alt={recipe.name} className="recipe-image" loading="lazy" /><span className="category-pill">{recipe.category || 'Doces'}</span><span className="card-heart"><Heart size={17} /></span></div>
      <div className="recipe-card-body"><div className="recipe-meta"><span><Clock3 size={14} /> {recipe.time || '—'} min</span><span>Feita com carinho</span></div><h3>{recipe.name}</h3><p>{recipe.description}</p><span className="card-link">Ver receita <ArrowRight size={15} /></span></div>
    </button>
  )
}

function RecipeModal({ recipe, onClose }) {
  if (!recipe) return null
  return <div className="modal-backdrop" onClick={onClose}><section className="recipe-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={recipe.name}><button className="modal-close" onClick={onClose} aria-label="Fechar"><X /></button><img src={recipe.image || fallbackImages[recipe.category] || fallbackImages.Bolos} alt={recipe.name} /><div className="modal-content"><span className="eyebrow">{recipe.category} · {recipe.time} min</span><h2>{recipe.name}</h2><p>{recipe.description}</p><h3>Ingredientes</h3><p className="recipe-text">{recipe.ingredients}</p><h3>Modo de preparo</h3><p className="recipe-text">{recipe.method}</p></div></section></div>
}

function App() {
  const [recipes, setRecipes] = useState(starterRecipes)
  const [category, setCategory] = useState('Todas')
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isConfigured) return
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snapshot => {
      const remote = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setRecipes(remote.length ? remote : starterRecipes)
    }, () => setNotice('Não foi possível carregar as receitas do Firebase. Confira a configuração e as regras do Firestore.'))
  }, [])

  const visibleRecipes = useMemo(() => recipes.filter(recipe => {
    const matchesCategory = category === 'Todas' || recipe.category === category
    const term = search.trim().toLocaleLowerCase('pt-BR')
    return matchesCategory && (!term || `${recipe.name} ${recipe.description} ${recipe.category}`.toLocaleLowerCase('pt-BR').includes(term))
  }), [recipes, category, search])

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const recipe = { name: data.get('name').trim(), description: data.get('description').trim(), ingredients: data.get('ingredients').trim(), method: data.get('method').trim(), time: Number(data.get('time')), category: data.get('category'), image: '', createdAt: serverTimestamp() }
    setSaving(true); setNotice('')
    try {
      if (isConfigured) {
        await addDoc(collection(db, 'recipes'), recipe)
      } else {
        setRecipes(current => [{ ...recipe, id: `local-${Date.now()}`, createdAt: new Date() }, ...current])
        setNotice('Receita adicionada nesta sessão. Configure o Firebase para salvá-la permanentemente.')
      }
      form.reset()
      if (isConfigured) setNotice('Sua receita foi cadastrada com sucesso! 💗')
    } catch (error) {
      console.error(error)
      setNotice('Não foi possível salvar. Verifique a conexão e as regras do Firestore.')
    } finally { setSaving(false) }
  }

  return <>
    <header className="site-header"><a className="brand" href="#inicio" aria-label="Candy Loves - início"><span className="brand-icon"><CakeSlice size={22} /></span><span>Candy <em>Loves</em><small>FEITO COM AMOR & AÇÚCAR</small></span></a><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">{menuOpen ? <X /> : <Menu />}</button><nav className={menuOpen ? 'main-nav is-open' : 'main-nav'}><a href="#inicio" onClick={() => setMenuOpen(false)}>Início</a><a href="#receitas" onClick={() => setMenuOpen(false)}>Receitas</a><a href="#cadastrar" className="nav-cta" onClick={() => setMenuOpen(false)}>Cadastrar receita <span>♡</span></a></nav></header>

    <main>
      <section className="hero" id="inicio"><div className="hero-copy"><span className="eyebrow"><Sparkles size={15} /> UM PEDACINHO DE DOÇURA</span><h1>Receitas feitas<br />com <em>amor</em> e açúcar<span className="pink-dot">.</span></h1><p>Um cantinho para compartilhar receitas especiais e transformar ingredientes simples em momentos inesquecíveis.</p><div className="hero-actions"><a className="button button-primary" href="#receitas">Descobrir receitas <ArrowRight size={17} /></a><a className="text-link" href="#cadastrar">Compartilhe a sua <ArrowDown size={15} /></a></div><div className="hero-note"><span className="note-hearts">♡ ♡ ♡</span><span>Feito para quem acredita que<br /> carinho também vai ao forno.</span></div><span className="hero-doodle doodle-one">✳</span><span className="hero-doodle doodle-two">♡</span></div><div className="hero-art"><div className="hero-photo"><img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=90" alt="Bolo confeitado com frutas vermelhas" /></div><div className="photo-caption"><span className="caption-heart">♡</span><span>um doce carinho<br /><strong>em cada receita</strong></span></div><div className="floating-strawberry">🍓</div><div className="hero-sparkle">✦</div></div><div className="hero-bottom-label">CANDY LOVES · DESDE SEMPRE ADOÇANDO</div></section>

      <section className="intro-strip"><span>feito com carinho</span><i>✳</i><span>compartilhado com amor</span><i>✳</i><span>adoçado na medida</span><i>✳</i><span>feito com carinho</span></section>

      <section className="recipes-section section-wrap" id="receitas"><div className="section-heading"><div><span className="eyebrow">O CADERNO DE RECEITAS</span><h2>Uma receita para<br /><em>cada desejo</em></h2></div><p>Do primeiro bolinho aos grandes momentos: encontre sua próxima delícia favorita.</p></div><div className="recipe-toolbar"><div className="category-list">{categories.map(item => <button key={item} className={category === item ? 'filter-chip active' : 'filter-chip'} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-box"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar uma receita..." aria-label="Buscar receitas" /></label></div><div className="recipe-grid">{visibleRecipes.map((recipe, index) => <RecipeCard key={recipe.id} recipe={recipe} index={index} onOpen={setSelectedRecipe} />)}</div>{visibleRecipes.length === 0 && <div className="empty-state"><span>🍒</span><h3>Nenhuma receita por aqui</h3><p>Tente outra busca ou escolha uma categoria diferente.</p></div>}<div className="recipes-footnote"><span>♡</span> {isConfigured ? 'Receitas atualizadas em tempo real pelo Firebase' : 'Receitas de inspiração · conecte o Firebase para compartilhar as suas'}</div></section>

      <section className="quote-banner"><div className="quote-decoration">❧</div><span className="eyebrow">UM LEMBRETE DOCE</span><p>“A vida fica mais leve<br />com um <em>docinho</em> no meio.”</p><span className="quote-heart">♡</span></section>

      <section className="form-section section-wrap" id="cadastrar"><div className="form-aside"><span className="eyebrow">SEU TOQUE ESPECIAL</span><h2>Tem uma receita<br />para <em>compartilhar?</em></h2><p>As melhores receitas são aquelas que passam de mão em mão. Conte pra gente como fazer a sua.</p><div className="aside-decoration">🍰 <span>+</span> 🍓</div><span className="aside-note">Toda receita tem uma história.<br />A sua merece ser contada.</span></div><form className="recipe-form" onSubmit={handleSubmit}><div className="form-title"><span className="form-icon"><CakeSlice size={19} /></span><div><h3>Nova receita</h3><p>Preencha os campos com carinho</p></div></div><label>Nome da receita<input name="name" placeholder="Ex.: Bolo de cenoura da vovó" required maxLength="80" /></label><label>Descrição<textarea name="description" placeholder="Conte um pouquinho sobre essa delícia..." rows="2" required maxLength="220" /></label><div className="form-row"><label>Tempo de preparo <span className="input-with-unit"><input name="time" type="number" placeholder="45" min="1" max="999" required /><small>min</small></span></label><label>Categoria<select name="category" required defaultValue=""><option value="" disabled>Escolha uma categoria</option>{categories.slice(1).map(item => <option key={item}>{item}</option>)}</select></label></div><label>Ingredientes<textarea name="ingredients" placeholder="Liste os ingredientes e as quantidades..." rows="3" required /></label><label>Modo de preparo<textarea name="method" placeholder="Explique o passo a passo da receita..." rows="4" required /></label><button className="button button-primary submit-button" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Cadastrar receita'} <Heart size={16} /></button>{notice && <p className="form-notice" role="status">{notice}</p>}<p className="firebase-hint">{isConfigured ? 'Conectado ao Firebase Firestore' : 'Modo demonstração · configure o Firebase para salvar receitas'}</p></form></section>
    </main>

    <footer className="site-footer"><a className="brand footer-brand" href="#inicio"><span className="brand-icon"><CakeSlice size={19} /></span><span>Candy <em>Loves</em><small>FEITO COM AMOR & AÇÚCAR</small></span></a><p>Um pouquinho de açúcar, um montão de amor. <span>♡</span></p><span className="copyright">© {new Date().getFullYear()} Candy Loves</span></footer>
    <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
  </>
}

export default App
