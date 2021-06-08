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
    it('Should increase user balance inside the contract', async function () {
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
    let SETDOCTOR;
    beforeEach(async function () {
      SETDOCTOR = await testament.connect(owner).setDoctor(alice.address);
    });
    it('Should set a user as a new doctor', async function () {
      expect(await testament.connect(owner).doctor()).to.equal(alice.address);
    });
    it('Should emit events SetDoctor', async function () {
      expect(SETDOCTOR).to.emit(testament, 'SetDoctor').withArgs(doctor.address, alice.address);
    });
    it('Should revert call if sender is not owner', async function () {
      await expect(testament.connect(bob).setDoctor(alice.address))
        .to.revertedWith('Testament: reserved to testament owner');
    });
    it('Should revert call if new doctor is owner', async function () {
      await expect(testament.connect(owner).setDoctor(owner.address))
        .to.revertedWith('Testament: cannot set yourself as doctor');
    });
  });
  describe('Died', async function () {
    let SETDIED;
    beforeEach(async function () {
      await testament.connect(owner).donate(alice.address, { value: GIVE_VALUE });
      SETDIED = await testament.connect(doctor).setDied();
    });
    it('Should change boolean variable to true', async function () {
      expect(await testament.died()).to.equal(true);
    });
    it('Should emits event SetDied', async function () {
      expect(SETDIED).to.emit(testament, 'SetDied').withArgs(owner.address, GIVE_VALUE);
    });
    it('Should revert call if the sender is not doctor', async function () {
      await expect(testament.connect(bob).setDied())
        .to.revertedWith('Testament: reserved to testament doctor');
    });
  });
  describe('Withdraw', async function () {
    let WITHDRAW;
    beforeEach(async function () {
      await testament.connect(owner).donate(alice.address, { value: GIVE_VALUE });
      await testament.connect(doctor).setDied();
      WITHDRAW = await testament.connect(alice).withdraw();
    });
    it('Should change balances of contract and user', async function () {
      expect(WITHDRAW).to.changeEtherBalances([testament, alice], [-GIVE_VALUE, GIVE_VALUE]);
    });
    it('Should descrease user balance inside the contract', async function () {
      expect(await testament.connect(alice).balance()).to.equal(0);
    });
    it('Should emits event Withdrew', async function () {
      expect(WITHDRAW).to.emit(testament, 'Withdrew').withArgs(alice.address, GIVE_VALUE);
    });
    it('Should revert call if owner is alive', async function () {
      testament = await TESTAMENT.connect(owner).deploy(doctor.address);
      await testament.deployed();
      await testament.connect(owner).donate(alice.address, { value: GIVE_VALUE });
      await expect(testament.connect(alice).withdraw()).to.revertedWith('Testament: testament owner actually alive');
    });
  });
});
