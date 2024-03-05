const {getUsers,deleteaUser, registerUser} = require('./services/userService');

// Mock the User model and its methods
jest.mock('./models/user', () => ({
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne:jest.fn()
}));

describe('User Management Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock function calls before each test
    });

    describe('registerUser function',()=>{
    it("should should throw error is name is missing",async()=>{
        const userData={
            lastName:"vernekar",
            email:"swapnil09@gmail.com",
            password:"Swappy12@"
        };
        //Execute registerUser function
        const result= await registerUser(userData);

        //assert
        expect(result).toEqual({success:false, message:'Name is required'});
    });

    it("should throw error if password is missing", async()=>{
        const userData={
            firstName:"swapnil",
            lastName:"vernekar",
            email:"swapnil09@mail.com"
        };

        const result = await registerUser(userData);
        //assert
        expect(result).toEqual({success:false,message:'Password is required and should be min 6 characters long'});
    })
        
    });
    
    describe('deleteaUser function', () => {
        it('should delete user successfully', async () => {
            // Mock deleted user data
            const userId = '123';
            const mockDeletedUser = { _id: userId, firstName: 'John' };

            // Mock User.findByIdAndDelete to return the deleted user
            const User = require('./models/user');
            User.findByIdAndDelete.mockResolvedValueOnce(mockDeletedUser);

            // Execute deleteaUser function
            const result = await deleteaUser(userId);

            // Assert
            expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockDeletedUser);
        });

        it('should throw an error if there is an issue in deleting user', async () => {
            // Mock error
            const errorMessage = 'Database error';

            // Mock User.findByIdAndDelete to throw an error
            const User = require('./models/user');
            User.findByIdAndDelete.mockRejectedValueOnce(new Error(errorMessage));

            // Assert
            await expect(deleteaUser('123')).rejects.toThrowError('User delete failed');
        });
    });

    describe('getUsers function', () => {
        it('should return users successfully', async () => {
            // Mock users data
            const mockUsers = [{ _id: '1', firstName: 'John' }, { _id: '2', firstName: 'Jane' }];

            // Mock User.find to return the users
            const User = require('./models/user');
            User.find.mockResolvedValueOnce(mockUsers);

            // Execute getUsers function
            const result = await getUsers();

            // Assertions
            expect(User.find).toHaveBeenCalled();
            expect(result).toEqual(mockUsers);
        });

        it('should throw an error if there is an issue in getting users', async () => {
            // Mock error
            const errorMessage = 'Database error';

            // Mock User.find to throw an error
            const User = require('./models/user');
            User.find.mockRejectedValueOnce(new Error(errorMessage));

            // Assertions
            await expect(getUsers()).rejects.toThrowError('Users fetch failed');
        });
    });
});
   




