// Simple test script to verify authentication endpoints
const BASE_URL = 'http://localhost:3000'

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n')

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing user registration...')
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      })
    })

    if (registerResponse.ok) {
      const registerData = await registerResponse.json()
      console.log('✅ Registration successful')
      console.log(`   User: ${registerData.user.name} (${registerData.user.email})`)
      console.log(`   Role: ${registerData.user.role}`)
      console.log(`   Token: ${registerData.token ? 'Generated' : 'Missing'}`)
      
      // Test 2: Login with the registered user
      console.log('\n2️⃣ Testing user login...')
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        console.log('✅ Login successful')
        console.log(`   Token: ${loginData.token ? 'Generated' : 'Missing'}`)

        // Test 3: Access protected endpoint
        console.log('\n3️⃣ Testing protected endpoint...')
        const profileResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          }
        })

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          console.log('✅ Protected endpoint access successful')
          console.log(`   Profile: ${profileData.user.name} (${profileData.user.email})`)
        } else {
          console.log('❌ Protected endpoint access failed')
          console.log(`   Status: ${profileResponse.status}`)
        }
      } else {
        console.log('❌ Login failed')
        console.log(`   Status: ${loginResponse.status}`)
      }
    } else {
      console.log('❌ Registration failed')
      console.log(`   Status: ${registerResponse.status}`)
      const errorData = await registerResponse.json()
      console.log(`   Error: ${errorData.error}`)
    }

    // Test 4: Test invalid login
    console.log('\n4️⃣ Testing invalid login...')
    const invalidLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
    })

    if (!invalidLoginResponse.ok) {
      console.log('✅ Invalid login properly rejected')
      console.log(`   Status: ${invalidLoginResponse.status}`)
    } else {
      console.log('❌ Invalid login should have been rejected')
    }

    console.log('\n🎉 Authentication system test completed!')

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testAuth()
}

module.exports = { testAuth }