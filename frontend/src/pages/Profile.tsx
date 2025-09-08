import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Shield } from 'lucide-react';

const Profile: React.FC = () => {
  const { state, isAdmin } = useAuth();

  if (!state.user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {state.user.firstName} {state.user.lastName}
                </h1>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{state.user.email}</span>
                </div>
                {isAdmin && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-600 font-medium">Administrator</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">First Name</dt>
                    <dd className="text-sm text-gray-900">{state.user.firstName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                    <dd className="text-sm text-gray-900">{state.user.lastName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{state.user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="text-sm text-gray-900 capitalize">{state.user.role}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        state.user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {state.user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                    <dd className="text-sm text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      {new Date(state.user.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(state.user.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;