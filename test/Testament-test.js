const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Testament', async function () {
  let TESTAMENT, testament, owner, doctor, alice, bob;
  const GIVE_VALUE = ethers.utils.parseEther('0.001');
  beforeEach(async function () {
    ;[owner, doctor, alice, bob] = await ethers.getSigners();
    TESTAMENT = await ethers.getContractFactory('Testament');
    testament = await TESTAMENT.connect(owner).deploy(doctor.address);
    await testament.deployed();
  });
  describe('Deployment', async function () {
    it('Should be the good owner', async function () {
      expect(await testament.owner()).to.equal(owner.address);
    });
    it('Should be the good doctor', async function () {
      expect(await testament.connect(owner).doctor()).to.equal(doctor.address);
    });
    it('Should emits event SetDoctor in constructor', async function () {
      const receipt = await testament.deployTransaction.wait();
      expect(receipt.transactionHash)
        .to.emit(testament, 'SetDoctor')
        .withArgs(ethers.constants.AddressZero, doctor.address);
    });
  });
  describe('Donate', async function () {
    let DONATE;
    beforeEach(async function () {
      DONATE = await testament.connect(owner).donate(alice.address, { value: GIVE_VALUE });
    });
    it('Should change balances of owner and contract', async function () {
      expect(DONATE).to.changeEtherBalances([owner, testament], [-GIVE_VALUE, GIVE_VALUE]);
    });
    it('Should change user balance inside the contract', async function () {
      expect(await testament.connect(alice).balance()).to.equal(GIVE_VALUE);
    });
    it('Should emit events Donation', async function () {
      expect(DONATE).to.emit(testament, 'Donation').withArgs(alice.address, GIVE_VALUE);
    });
    it('Should revert call if receiver is also owner', async function () {
      await expect(testament.connect(owner).donate(owner.address, { value: GIVE_VALUE }))
        .to.revertedWith('Testament: cannot donate to yourself');
    });
    it('Should revert call if sender is not owner', async function () {
      await expect(testament.connect(alice).donate(bob.address, { value: GIVE_VALUE }))
        .to.revertedWith('Testament: reserved to testament owner');
    });
  });
  describe('Doctor', async function () {
    it('Should set bob as a new doctor');
    it('Should revert call if new doctor is owner');
    it('Should emit events setDoctor');
  });
});
