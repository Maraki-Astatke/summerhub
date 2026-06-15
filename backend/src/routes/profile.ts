import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('GET profile for user:', userId);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('=== PROFILE UPDATE START ===');
    console.log('User ID:', userId);
    console.log('Received body:', JSON.stringify(req.body, null, 2));
    
    const { 
      firstName, 
      lastName, 
      age, 
      grade, 
      city, 
      schoolName, 
      bio,
      profession,
      company 
    } = req.body;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User role:', user.role);
    console.log('Existing profile:', user.profile);
    
    // Update user table (common for all roles)
    if (firstName || lastName) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
        }
      });
      console.log('User table updated');
    }
    
    // Prepare update data - COMMON FIELDS FOR ALL ROLES
    const updateData: any = {};
    
    // First Name & Last Name are handled in user table above
    if (city !== undefined) updateData.city = city;
    if (bio !== undefined) updateData.bio = bio;
    
    // ROLE-SPECIFIC FIELDS
    switch (user.role) {
      case 'student':
        // Student: Age, Grade, School Name
        if (age !== undefined) updateData.age = age ? parseInt(age) : null;
        if (grade !== undefined) updateData.grade = grade;
        if (schoolName !== undefined) updateData.schoolName = schoolName;
        break;
        
      case 'teacher':
        // Teacher: Profession, Company
        if (profession !== undefined) updateData.profession = profession;
        if (company !== undefined) updateData.company = company;
        break;
        
      case 'seller':
        // Seller: Company only
        if (company !== undefined) updateData.company = company;
        // Optionally add profession if seller needs it in future
        break;
        
      case 'admin':
        // Admin: No additional fields (only firstName, lastName, city, bio)
        // Add any admin-specific fields here if needed in future
        break;
        
      case 'parent':
        // Parent: No additional fields (only firstName, lastName, city, bio)
        // Add any parent-specific fields here if needed in future
        break;
        
      default:
        console.log('Unknown role:', user.role);
        break;
    }
    
    console.log('Update data for profile:', updateData);
    
    let profile;
    
    if (user.profile) {
      profile = await prisma.profile.update({
        where: { userId },
        data: updateData
      });
      console.log('Profile updated');
    } else {
      profile = await prisma.profile.create({
        data: {
          userId,
          ...updateData
        }
      });
      console.log('Profile created');
    }
    
    // Return updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
    
    const { password, ...userWithoutPassword } = updatedUser;
    console.log('=== PROFILE UPDATE SUCCESS ===');
    res.json(userWithoutPassword);
    
  } catch (error) {
    console.error('=== PROFILE UPDATE ERROR ===');
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

export default router;