export default class CadastroPage {
  inputNome = '#name';
  inputEmail = '#email';
  buttonLimpar = '[data-test-id="clearButton"]';
  buttonCadastrar = 'button[type="submit"]';

  linkPaginaUsuarios = '[href="./usuarios.html"]';
  linkPaginaSobre = '[href="./sobre.html"]';

  listaUsuarios = '#lista-usuarios';

  typeNome(nome) {
    cy.get(this.inputNome).type(nome);
  }

  typeEmail(email) {
    cy.get(this.inputEmail).type(email);
  }

  clickButtonCadastrar() {
    cy.get(this.buttonCadastrar).click();
  }

  clickButtonLimpar() {
    cy.get(this.buttonLimpar).click();
  }

  getListaUsuarios() {
    return cy.get(this.listaUsuarios);
  }

  cadastrar(nome, email) {
    this.typeNome(nome);
    this.typeEmail(email);
    this.clickButtonCadastrar();
  }
}
