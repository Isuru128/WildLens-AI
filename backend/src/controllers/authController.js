const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

const normalizeEmail = (email) =>
    String(email || '').trim().toLowerCase();

const normalizePhone = (phone) =>
    String(phone || '').replace(/\D/g, '');

const formatUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role
});

// REGISTER USER
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        const normalizedName = String(name || '').trim();
        const normalizedEmail = normalizeEmail(email);
        const mobileNumber = normalizePhone(phone);

        if (
            !normalizedName ||
            !password ||
            (!normalizedEmail && !mobileNumber)
        ) {
            return res.status(400).json({
                msg: 'Name, email or mobile number, and password are required'
            });
        }

        if (
            normalizedEmail &&
            !EMAIL_REGEX.test(normalizedEmail)
        ) {
            return res.status(400).json({
                msg: 'Invalid email address'
            });
        }

        if (
            mobileNumber &&
            !PHONE_REGEX.test(mobileNumber)
        ) {
            return res.status(400).json({
                msg: 'Mobile number must be exactly 10 digits'
            });
        }

        const filters = [];

        if (normalizedEmail) {
            filters.push(`email.eq.${normalizedEmail}`);
        }

        if (mobileNumber) {
            filters.push(`phone.eq.${mobileNumber}`);
        }

        let existingUser = null;

        if (filters.length > 0) {
            const { data } = await supabase
                .from('users')
                .select('*')
                .or(filters.join(','));

            if (data && data.length > 0) {
                existingUser = data[0];
            }
        }

        if (existingUser) {
            if (
                normalizedEmail &&
                existingUser.email === normalizedEmail
            ) {
                return res.status(400).json({
                    msg: 'Email already exists'
                });
            }

            if (
                mobileNumber &&
                existingUser.phone === mobileNumber
            ) {
                return res.status(400).json({
                    msg: 'Mobile number already exists'
                });
            }
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const { data: user, error } = await supabase
            .from('users')
            .insert([
                {
                    name: normalizedName,
                    email: normalizedEmail || null,
                    phone: mobileNumber || null,
                    password: hashedPassword,
                    role: 'user'
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            msg: 'User registered successfully',
            user: formatUser(user)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            msg: error.message
        });
    }
};

// LOGIN USER OR ADMIN WITH EMAIL OR PHONE
exports.login = async (req, res) => {
    try {
        const {
            identifier,
            email,
            phone,
            password
        } = req.body;

        const loginIdentifier = String(
            identifier || email || phone || ''
        ).trim();

        if (!loginIdentifier || !password) {
            return res.status(400).json({
                msg: 'Email/mobile number and password are required'
            });
        }

        let user = null;

        if (/^\d+$/.test(loginIdentifier)) {

            const mobileNumber =
                normalizePhone(loginIdentifier);

            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('phone', mobileNumber)
                .single();

            user = data;

        } else {

            const normalizedEmail =
                normalizeEmail(loginIdentifier);

            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('email', normalizedEmail)
                .single();

            user = data;
        }

        if (!user) {
            return res.status(401).json({
                msg: 'Invalid credentials'
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                msg: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.status(200).json({
            msg: 'Login successful',
            token,
            user: formatUser(user)
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            msg: 'Server error'
        });
    }
};

// GET CURRENT PROFILE
exports.me = async (req, res) => {
    try {
        const { data: user, error } =
            await supabase
                .from('users')
                .select(
                    'id,name,email,phone,role,created_at'
                )
                .eq('id', req.user.id)
                .single();

        if (error || !user) {
            return res.status(404).json({
                msg: 'User not found'
            });
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        res.status(500).json({
            msg: 'Server error'
        });
    }
};

// UPDATE CURRENT PROFILE
exports.updateMe = async (req, res) => {
    try {

        const { name, email, phone } = req.body;

        const updates = {};

        if (name !== undefined) {
            updates.name = String(name).trim();
        }

        if (email !== undefined) {

            const normalizedEmail =
                normalizeEmail(email);

            const { data: existingEmail } =
                await supabase
                    .from('users')
                    .select('id')
                    .eq('email', normalizedEmail)
                    .neq('id', req.user.id)
                    .single();

            if (existingEmail) {
                return res.status(400).json({
                    msg: 'Email already exists'
                });
            }

            updates.email = normalizedEmail;
        }

        if (phone !== undefined) {

            const mobileNumber =
                normalizePhone(phone);

            const { data: existingPhone } =
                await supabase
                    .from('users')
                    .select('id')
                    .eq('phone', mobileNumber)
                    .neq('id', req.user.id)
                    .single();

            if (existingPhone) {
                return res.status(400).json({
                    msg: 'Phone already exists'
                });
            }

            updates.phone = mobileNumber;
        }

        const { data: user, error } =
            await supabase
                .from('users')
                .update(updates)
                .eq('id', req.user.id)
                .select()
                .single();

        if (error) throw error;

        res.status(200).json({
            msg: 'Profile updated successfully',
            user
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            msg: 'Server error'
        });
    }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
    try {

        const {
            currentPassword,
            newPassword,
            confirmPassword
        } = req.body;

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            return res.status(400).json({
                msg: 'All fields are required'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                msg: 'Passwords do not match'
            });
        }

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (!user) {
            return res.status(404).json({
                msg: 'User not found'
            });
        }

        const isMatch =
            await bcrypt.compare(
                currentPassword,
                user.password
            );

        if (!isMatch) {
            return res.status(400).json({
                msg: 'Current password is incorrect'
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );

        const { error } = await supabase
            .from('users')
            .update({
                password: hashedPassword
            })
            .eq('id', req.user.id);

        if (error) throw error;

        res.status(200).json({
            msg: 'Password changed successfully'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            msg: 'Server error'
        });
    }
};

// GOOGLE AUTHENTICATION
exports.googleLogin = async (req, res) => {
    try {
        const { idToken, email, name, accessToken } = req.body;

        if (!idToken && !email && !accessToken) {
            return res.status(400).json({
                msg: 'Google ID token, access token, or email is required'
            });
        }

        let verifiedEmail = email;
        let verifiedName = name;

        // Verify with Google tokeninfo endpoint if idToken is supplied
        if (idToken) {
            try {
                const googleRes = await fetch(
                    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
                );
                if (googleRes.ok) {
                    const data = await googleRes.json();
                    if (data.email) {
                        verifiedEmail = data.email;
                        verifiedName = data.name || verifiedName;
                    }
                }
            } catch (err) {
                console.warn('Google token verification fallback:', err.message);
            }
        } else if (accessToken) {
            try {
                const userinfoRes = await fetch(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    }
                );
                if (userinfoRes.ok) {
                    const data = await userinfoRes.json();
                    if (data.email) {
                        verifiedEmail = data.email;
                        verifiedName = data.name || verifiedName;
                    }
                }
            } catch (err) {
                console.warn('Google userinfo fetch fallback:', err.message);
            }
        }

        const normalizedEmail = normalizeEmail(verifiedEmail);
        if (!normalizedEmail) {
            return res.status(400).json({
                msg: 'A valid email is required from the Google account'
            });
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', normalizedEmail)
            .single();

        let user = existingUser;

        if (!user) {
            // Auto-create user
            const randomPassword = Math.random().toString(36).slice(-12) + Date.now();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            const { data: newUser, error } = await supabase
                .from('users')
                .insert([
                    {
                        name: verifiedName || normalizedEmail.split('@')[0],
                        email: normalizedEmail,
                        phone: null,
                        password: hashedPassword,
                        role: 'user'
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            user = newUser;
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.status(200).json({
            msg: 'Google login successful',
            token,
            user: formatUser(user)
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            msg: error.message || 'Google authentication failed'
        });
    }
};

// APPLE AUTHENTICATION
exports.appleLogin = async (req, res) => {
    try {
        const { identityToken, email, fullName, user: appleUserId } = req.body;

        if (!identityToken && !email) {
            return res.status(400).json({
                msg: 'Apple identity token or email is required'
            });
        }

        let userEmail = email;
        let userName = fullName
            ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
            : '';

        // Decode JWT payload if identityToken is present
        if (identityToken) {
            try {
                const decoded = jwt.decode(identityToken);
                if (decoded && decoded.email) {
                    userEmail = decoded.email;
                }
            } catch (err) {
                console.warn('Apple token decode warning:', err.message);
            }
        }

        // Fallback user identifier if email is hidden by Apple Private Relay
        const normalizedEmail = normalizeEmail(userEmail) || (appleUserId ? `apple_${appleUserId}@wildlens.ai` : null);

        if (!normalizedEmail) {
            return res.status(400).json({
                msg: 'Email or Apple user ID is required'
            });
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', normalizedEmail)
            .single();

        let user = existingUser;

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-12) + Date.now();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            const { data: newUser, error } = await supabase
                .from('users')
                .insert([
                    {
                        name: userName || 'Apple User',
                        email: normalizedEmail,
                        phone: null,
                        password: hashedPassword,
                        role: 'user'
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            user = newUser;
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.status(200).json({
            msg: 'Apple login successful',
            token,
            user: formatUser(user)
        });
    } catch (error) {
        console.error('Apple auth error:', error);
        res.status(500).json({
            msg: error.message || 'Apple authentication failed'
        });
    }
};