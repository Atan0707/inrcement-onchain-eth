const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AssetManager", function () {
  let AssetManager, assetManager, owner, admin, addr1;

  beforeEach(async function () {
    [owner, admin, addr1] = await ethers.getSigners();
    AssetManager = await ethers.getContractFactory("AssetManager");
    assetManager = await AssetManager.deploy();
    await assetManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await assetManager.owner()).to.equal(owner.address);
    });
  });

  describe("Admin Management", function () {
    it("Should allow owner to add admin", async function () {
      await assetManager.addAdmin(admin.address);
      expect(await assetManager.isAdmin(admin.address)).to.be.true;
    });

    it("Should not allow non-owner to add admin", async function () {
      await expect(
        assetManager.connect(addr1).addAdmin(admin.address)
      ).to.be.revertedWith("Only owner has access");
    });
  });

  describe("Customer Management", function () {
    it("Should allow admin or owner to add customer data", async function () {
      await assetManager.addAdmin(admin.address);
      const customerId = await assetManager
        .connect(admin)
        .addCustomerData("John Doe", "123456", "555-5555", "123 Main St");
      expect(customerId).to.equal(1);
    });

    it("Should retrieve customer data correctly", async function () {
      await assetManager.addCustomerData("John Doe", "123456", "555-5555", "123 Main St");
      const customer = await assetManager.getCustomerData(1);
      expect(customer.name).to.equal("John Doe");
      expect(customer.ic).to.equal("123456");
      expect(customer.contactNo).to.equal("555-5555");
      expect(customer.Address).to.equal("123 Main St");
    });
  });

  describe("Property Management", function () {
    it("Should allow admin or owner to add properties", async function () {
      await assetManager.addCustomerData("John Doe", "123456", "555-5555", "123 Main St");
      await assetManager.addCustomerProperty(1, "House", "A nice house", "ipfs://image");
      const properties = await assetManager.getCustomerProperties(1);
      expect(properties[0].title).to.equal("House");
    });
  });

  describe("Inheritor Management", function () {
    it("Should allow admin or owner to add inheritors", async function () {
      await assetManager.addCustomerData("John Doe", "123456", "555-5555", "123 Main St");
      await assetManager.addCustomerInheritor(1, "Jane Doe", "654321", "555-5556", "456 Main St");
      const inheritors = await assetManager.getCustomerInheritors(1);
      expect(inheritors[0].name).to.equal("Jane Doe");
    });
  });

  describe("Update and Delete", function () {
    it("Should allow admin or owner to update customer data", async function () {
      await assetManager.addCustomerData("John Doe", "123456", "555-5555", "123 Main St");
      await assetManager.updateCustomerData(1, "John Smith", "123456", "555-5555", "123 Main St");
      const customer = await assetManager.getCustomerData(1);
      expect(customer.name).to.equal("John Smith");
    });

    it("Should allow admin or owner to delete customer data", async function () {
      await assetManager.addCustomerData("John Doe", "123456", "555-5555", "123 Main St");
      await assetManager.deleteCustomerData(1);
      await expect(assetManager.getCustomerData(1)).to.be.revertedWith("Customer does not exist.");
    });
  });
});