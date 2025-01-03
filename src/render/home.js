const UserSchema = require('../models/user');
const LawsuitSchema = require('../models/lawsuit');

const homePage = async function (req, res, next) {
  try {
    // Busca o usuário pelo ID e traz seu saldo de páginas
    const user = await UserSchema.findById(req.user._id).lean();

    // Se não encontrar o usuário, redireciona para uma página de erro
    if (!user) {
      console.error('Usuário não encontrado');
      return res.redirect('/error');
    }

    // Pegando o saldo de páginas do usuário (com fallback para 0)
    const pagesBalance = user.pagesBalance || 0;

    // Define o filtro para buscar processos do usuário
    let query = { owner: req.user._id };
    if (req.query.npu) {
      query.identifier = new RegExp(req.query.npu, 'i');
    }

    // Faz a paginação dos processos do usuário
    const suits = await LawsuitSchema.paginate(query, {
      page: req.query.page || 1,
      limit: 10,
      sort: { createdAt: -1 }
    });

    // Renderiza a página passando as informações corretas
    res.render('pages/home', { user: req.user, suits, npu: req.query.npu, pagesBalance });
  } catch (error) {
    console.error('Erro ao buscar as informações do usuário:', error);
    res.redirect('/error');
  }
};

module.exports = {
  homePage,
};
